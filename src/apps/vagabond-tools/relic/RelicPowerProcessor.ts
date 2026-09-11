import { HeroDataModel } from "../../../model/actor/HeroDataModel"
import { EquipmentDataModel, EquipmentSchema } from "../../../model/item/equip/EquipmentDataModel"
import { inventoryItemTypes } from "../../../utils/modelUtil"
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

    static applyHeroBonuses = (actor: Actor & { system: HeroDataModel }) => {
        const equippedRelics = actor.system.equippedRelics()
        if (!equippedRelics || equippedRelics.length === 0) return

        console.log("Implement me!", actor.system, equippedRelics)
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
            if (currentValue === undefined) continue

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
                if (relicMod.path && relicMod.value) {
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

    static applySavingModifiers = (actor: Actor & { system: HeroDataModel }, heroMods: any) => {
        const relics = actor.items.filter((it: any) => inventoryItemTypes().includes(it.type) && it.system.isRelic()) as any[]
        if (!relics || relics.length === 0) return
        RelicPowerProcessor.applyRelicPowers(relics.flatMap(it => it.system.relicPowers), heroMods)
    }

    private static dedupePowers = (relics) => {
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