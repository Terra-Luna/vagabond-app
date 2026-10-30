import type { HeroDataModel } from "../../../model/actor/HeroDataModel"
import type { EquipmentDataModel, EquipmentSchema } from "../../../model/item/equip/EquipmentDataModel"
import type { RelicPower } from "./RelicPowers"
import { RelicPowers } from "./RelicPowers"

const getModifierSelectors = (mod: any): string[] => {
    if (Array.isArray(mod?.selector) && mod.selector.length > 0) return mod.selector
    return typeof mod?.path === "string" ? [mod.path] : []
}

export class RelicPowerProcessor {

    static getFormattedRelicName = (relic: RelicPower): string => {
        if (['ace', 'bane', 'protection'].includes(relic.category.value)) {
            return `${relic.category.label} - ${relic.power.label}`
        }
        else {
            return relic.power.label
        }
    }

    /**
     * Called from Hero's prepareDerivedData - applies relic bonuses in-memory only.
     */
    static applyHeroBonuses = (actor: Actor & { system: HeroDataModel }) => {
        const equippedRelics = actor.system.equippedRelics()
        if (!equippedRelics || equippedRelics.length === 0) return

        equippedRelics.forEach(item => {
            const filteredRelics = (item.system.relicPowers as RelicPower[]).flatMap(it => ({
                ...it,
                power: {
                    modifiers: it.power.modifiers.flatMap(mod => {
                        const selectors = getModifierSelectors(mod).filter(selector =>
                            selector.startsWith("system.") &&
                            foundry.utils.getProperty(actor, selector) !== undefined
                        )
                        return selectors.length > 0 ? [{ selector: selectors, value: mod.value }] : []
                    })
                }
            })).filter(it => it.power.modifiers.length > 0) as RelicPower[]

            RelicPowerProcessor.applyRelicPowers(filteredRelics, actor)
        })
    }

    /**
     * Removes or adds the effect of a relic on an item, updating its properties accordingly.
     */
    static toggleRelicEffect = async (item: Item & { system: EquipmentDataModel<EquipmentSchema> }, relic: RelicPower) => {
        const existingPowers = item.system.relicPowers

        if (existingPowers.some(p => p.id === relic.id)) {
            // Remove
            await item.update({ 'system.relicPowers': [...existingPowers.filter(p => p.id !== relic.id)] } as Record<string, any>)
            await this.updateItemProperties(item, relic, 'remove')
        }
        else {
            // Add
            await item.update({ 'system.relicPowers': [...existingPowers, relic] } as Record<string, any>)
            await this.updateItemProperties(item, relic, 'add')
        }
    }

    /**
     * Update the item with DB-backed properties based on the relic's modifiers and the specified event ('add' or 'remove').
     */
    static updateItemProperties = async (item: Item, relic: RelicPower, event: 'add' | 'remove') => {
        await RelicPowerProcessor.syncAppliedEffect(item, relic, event)
        if (!relic.power.modifiers || relic.power.modifiers.length === 0) return

        for (const mod of relic.power.modifiers) {
            for (const selector of getModifierSelectors(mod)) {
                const currentValue = foundry.utils.getProperty(item, selector)
                if (typeof currentValue !== 'number') continue
                const delta = event === 'add' ? mod.value : -mod.value
                await item.update({ [selector]: currentValue + delta })
            }
        }
    }

    /**
     * Status effects granted by an item's relic powers. Falls back to the built-in definition so
     * powers stored before `appliedEffect` existed still work.
     */
    static getRelicAppliedEffects = (relics?: RelicPower[]): { effect: string, duration: string, damageType?: string }[] => {
        const builtIn = RelicPowers.utility as unknown as RelicPower[]
        return (relics ?? []).flatMap(relic => {
            const fx = relic.power?.appliedEffect ?? builtIn.find(it => it.id === relic.id)?.power?.appliedEffect
            return fx?.effect ? [{ effect: fx.effect, duration: fx.duration ?? '', damageType: fx.damageType || undefined }] : []
        })
    }

    /**
     * Sets the damage type carried by a relic's applied effect (e.g. the type of Burning).
     */
    static setRelicDamageType = async (item: Item & { system: EquipmentDataModel<EquipmentSchema> }, relic: RelicPower, damageType: string) => {
        const fx = RelicPowerProcessor.getRelicAppliedEffects([relic])[0]
        if (!fx) return
        const updated = item.system.relicPowers.map(p => p.id === relic.id
            ? { ...p, power: { ...p.power, appliedEffect: { effect: fx.effect, duration: fx.duration, damageType } } }
            : p)
        await item.update({ 'system.relicPowers': updated } as Record<string, any>)
    }

    /**
     * Adds or removes the relic's status effect (e.g. Burning) on the item's appliedEffects.
     */
    private static syncAppliedEffect = async (item: Item, relic: RelicPower, event: 'add' | 'remove') => {
        const fx = RelicPowerProcessor.getRelicAppliedEffects([relic])[0]
        if (!fx) return
        const current: any[] = (item.system as any).appliedEffects ?? []
        const isSame = (it: any) => it.effect === fx.effect && (it.duration ?? '') === (fx.duration ?? '')

        const updated = event === 'add'
            ? [...current.filter(it => !isSame(it)), { effect: fx.effect, duration: fx.duration ?? '', critDuration: '' }]
            : current.filter(it => !isSame(it))
        await item.update({ 'system.appliedEffects': updated } as Record<string, any>)
    }

    /**
     * Splices in the item's relic modifiers into the Hero's to be applied "just-in-time"
     * for an attack involving the Weapon or Item. Relic powers are sorted by their ID and
     * more than one relic effect of the same type can be applied. Higher ranks will take
     * precedence.
     * @param item 
     * @param heroMods 
     * @param options.skillTrained
     */
    static applyRelicPowers = (relics?: RelicPower[], heroMods?: any, options?: { skillTrained?: boolean }) => {
        if (!relics || relics.length === 0 || !heroMods) return

        const eligible = options?.skillTrained === false
            ? relics.filter(relic => relic.category?.value !== 'ace')
            : relics
        const deduped = RelicPowerProcessor.dedupePowers(eligible)

        deduped.forEach(relic => {
            relic.power.modifiers?.forEach(relicMod => {
                if (relicMod.value === undefined) return

                getModifierSelectors(relicMod).forEach(selector => {
                    const keys = selector.split('.')

                    let current = heroMods
                    for (let i = 0; i < keys.length - 1; i++) {
                        current = current?.[keys[i]]
                    }

                    const targetKey = keys[keys.length - 1]

                    if (current && targetKey in current) {
                        const currentValue = current[targetKey]

                        if (typeof currentValue === 'number') {
                            current[targetKey] = currentValue + (relicMod.value ?? 0)
                        }
                        else if (typeof currentValue === 'boolean') {
                            current[targetKey] = relicMod.value
                        }
                    }
                })
            })
        })
    }

    private static dedupePowers = (relics): RelicPower[] => {
        const deduped: RelicPower[] = []
        const sorted = relics.sort((a, b) => b.id.localeCompare(a.id))
        sorted.forEach(relic => {
            if (!deduped.some(dd => dd.id.startsWith(relic.id.slice(0, -1)))) {
                deduped.push(relic)
            }
        })
        return deduped
    }

}
