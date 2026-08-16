import { statsSchema } from "../../model/actor/type/Stats"
import { isEligibleForPerk, PerkDataModel } from "../../model/item/character/PerkDataModel"
import { SpellDataModel } from "../../model/item/character/SpellDataModel"
import { EquipmentDataModel, EquipmentSchema } from "../../model/item/equip/EquipmentDataModel"
import { CombinedItemsMultiType, getFullItem, inventoryItemTypes } from "../../utils/modelUtil"

export class ItemsCache {
    /**
     * A cache of compendium + world items by uuid and item data.
     */
    static items = new Map<string, any>()

    static allItems = () => {
        return [...new Map([...this.items.entries()]).values()]
            .filter(it => it != null)
            .sort((a, b) => a.name.localeCompare(b.name)) as Item[]
    }

    static spells = () => {
        return [...new Map([...this.items.entries()]
            .filter(([_, item]) => item.type === 'spell')).values()]
            .filter(it => it != null)
            .sort((a, b) => a.name.localeCompare(b.name)) as (Item & { system: SpellDataModel })[]
    }

    static perks = () => {
        return [...new Map([...this.items.entries()]
            .filter(([_, item]) => item.type === 'perk')).values()]
            .filter(it => it != null)
            .sort((a, b) => a.name.localeCompare(b.name)) as (Item & { system: PerkDataModel })[]
    }

    static eligiblePerks = (stats: ReturnType<typeof statsSchema>, trainings: string[], spells: string[]) => {
        const perks = this.perks()
        return perks.filter(perk => isEligibleForPerk(stats, trainings, spells, perk.system))
    }

    static equipment = (): (Item & { system: EquipmentDataModel<EquipmentSchema> })[] => {
        return [...new Map([...this.items.entries()]
            .filter(([_, item]) => item.visible && inventoryItemTypes().includes(item.type))).values()]
            .filter(it => it != null)
            .sort((a, b) => a.name.localeCompare(b.name))
            .sort((a, b) => a.system.category.localeCompare(b.system.category)) as (Item & { system: EquipmentDataModel<EquipmentSchema> })[]
    }

    static packs = (): (Item & { system: any })[] => {
        return [...new Map([...this.items.entries()]
            .filter(([_, item]) => item.type === 'starterpack')).values()]
            .filter(it => it != null)
            .sort((a, b) => a.name.localeCompare(b.name)) as (Item & { system: any })[]
    }

    /**
     * Initialize a cache by pre-fetching rules-eligible items so the Hero's
     * prepareDerivedData function isn't running async operations.
     */
    static async initialize() {
        this.items.clear()

        const allItems = await CombinedItemsMultiType(
            ['spell', 'perk', 'alchemical', 'weapon', 'armor', 'tool', 'sundry', 'container', 'starterpack']
        )

        for (const item of allItems) {
            const fullItem = await getFullItem(item)
            if (fullItem) {
                this.items.set(fullItem.uuid, fullItem)
            }
        }

        Hooks.callAll("onItemsCacheInitialized" as any, ItemsCache)
    }

    static async updateItem(item: any) {
        const validTypes = ['spell', 'perk']
        if (!validTypes.includes(item.type)) return

        const fullItem = await getFullItem(item)
        if (fullItem) {
            this.items.set(fullItem.uuid, fullItem)
            this.refreshAllActors()
        }
    }

    static removeItem(uuid: string) {
        if (this.items.has(uuid)) {
            this.items.delete(uuid)
            this.refreshAllActors()
        }
    }

    static refreshAllActors() {
        game.actors
            ?.filter(it => (it.type as string) === 'hero')
            ?.forEach(actor => (actor as any).forceUpdate())
    }

}