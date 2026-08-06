import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { inventoryItemTypes } from "../../model/actor/type/Inventory"
import { statsSchema } from "../../model/actor/type/Stats"
import { isEligibleForPerk, PerkDataModel } from "../../model/item/character/PerkDataModel"
import { SpellDataModel } from "../../model/item/character/SpellDataModel"
import { EquipmentDataModel, EquipmentSchema } from "../../model/item/equip/EquipmentDataModel"
import { StarterPackDataModel } from "../../model/item/equip/StarterPackDataModel"
import { CombinedItemsMultiType, getFullItem } from "../../utils/modelUtil"

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

    static packs = (): (Item & { system: StarterPackDataModel })[] => {
        return [...new Map([...this.items.entries()]
            .filter(([_, item]) => item.type === 'starterpack')).values()]
            .filter(it => it != null)
            .sort((a, b) => a.name.localeCompare(b.name)) as (Item & { system: StarterPackDataModel })[]
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
            ?.filter(it => it.system instanceof HeroDataModel)
            ?.forEach(actor => (actor.system as HeroDataModel).forceUpdate())
    }

}