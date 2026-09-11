import { HeroDataModel } from "../../../model/actor/HeroDataModel"
import { EquipmentDataModel, EquipmentSchema } from "../../../model/item/equip/EquipmentDataModel"
import { RelicPower } from "./RelicPowers"

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
     * @param actor 
     * @returns 
     */
    static applyHeroBonuses = (actor: Actor & { system: HeroDataModel }) => {
        const equippedRelics = actor.system.equippedRelics()
        if (!equippedRelics || equippedRelics.length === 0) return

        const relics = equippedRelics.flatMap(it => it.system.relicPowers) as RelicPower[]

        const filteredRelics = relics.flatMap(it => ({
            ...it,
            power: {
                modifiers: [
                    ...it.power.modifiers.filter(mod =>
                        mod.path.startsWith("system.") &&
                        foundry.utils.getProperty(actor, mod.path) !== undefined
                    ).map(mod => {
                        return { path: mod.path, value: mod.value }
                    })
                ]
            }
        })).filter(it => it.power.modifiers.length > 0) as RelicPower[]

        RelicPowerProcessor.applyRelicPowers(filteredRelics, actor)
    }

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
     * Update the item with DB-backed properies.
     * @param item 
     * @param relic 
     * @param event 
     */
    static updateItemProperties = async (item: Item, relic: RelicPower, event: 'add' | 'remove') => {
        for (const mod of relic.power.modifiers) {
            const currentValue = foundry.utils.getProperty(item, mod.path)
            if (currentValue !== undefined) {
                if (event === 'add') {
                    if (typeof currentValue === 'number') {
                        await item.update({ [mod.path]: currentValue + mod.value })
                    }
                }
                else {
                    if (typeof currentValue === 'number') {
                        await item.update({ [mod.path]: currentValue - mod.value })
                    }
                }
            }
        }
    }

    /**
     * Splices in the item's relic modifiers into the Hero's to be applied "just-in-time"
     * for an attack involving the Weapon or Item. Relic powers are sorted by their ID and
     * more than one relic effect of the same type can be applied. Higher ranks will take
     * precedence.
     * @param item 
     * @param heroMods 
     */
    static applyRelicPowers = (relics?: RelicPower[], heroMods?: any) => {
        if (!relics || relics.length === 0 || !heroMods) return

        const deduped = RelicPowerProcessor.dedupePowers(relics)

        deduped.forEach(relic => {
            relic.power.modifiers?.forEach(relicMod => {
                if (relicMod.path && relicMod.value !== undefined) {
                    const keys = relicMod.path.split('.')

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
                }
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