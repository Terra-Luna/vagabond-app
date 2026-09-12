import { statsSchema } from "../../model/actor/type/Stats"
import { isEligibleForPerk, PerkDataModel } from "../../model/item/character/PerkDataModel"
import { SpellDataModel } from "../../model/item/character/SpellDataModel"
import { AlchemicalItemDataModel } from "../../model/item/equip/AlchemicalItemDataModel"
import { EquipmentDataModel, EquipmentSchema } from "../../model/item/equip/EquipmentDataModel"
import { SundryDataModel } from "../../model/item/equip/SundryDataModel"
import { CombinedItemsMultiType, getFullItem, inventoryItemTypes } from "../../utils/modelUtil"

export class ItemsCache {
    /**
     * A cache of compendium + world items by uuid and item data.
     */
    static items = new Map<string, any>()

    /**
     * Initialize the cache by fetching all items at once. Keep performance quick
     * by pre-fetching the full Items in // batches for rules-bearing Items. This
     * will keep Heroes prep derived data from being bogged own on app load.
     */
    static async initialize() {
        this.items.clear()

        const allItems = await CombinedItemsMultiType(
            ['spell', 'perk', 'alchemical', 'weapon', 'armor', 'sundry', 'container', 'startingpack']
        )

        for (const item of allItems) {
            if (item?.uuid) {
                this.items.set(item.uuid, item)
            }
        }

        const ruleItemEntries = allItems.filter(
            item => !(item instanceof Item) && (item.type === 'spell' || item.type === 'perk' || item.type === 'startingpack')
        )

        const BATCH_SIZE = 25
        for (let i = 0; i < ruleItemEntries.length; i += BATCH_SIZE) {
            const batch = ruleItemEntries.slice(i, i + BATCH_SIZE)
            const resolved = await Promise.all(batch.map(entry => getFullItem(entry)))
            for (const doc of resolved) {
                if (doc?.uuid) {
                    this.items.set(doc.uuid, doc)
                }
            }
        }

        Hooks.callAll("onItemsCacheInitialized" as any, ItemsCache)
    }

    static allItems = () => {
        return Array.from(this.items.values())
            .filter(it => it != null)
            .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "")) as Item[]
    }

    static spells = () => {
        return Array.from(this.items.values())
            .filter(item => item != null && item.type === 'spell')
            .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "")) as (Item & { system: SpellDataModel })[]
    }

    static perks = () => {
        return Array.from(this.items.values())
            .filter(item => item != null && item.type === 'perk')
            .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "")) as (Item & { system: PerkDataModel })[]
    }

    static eligiblePerks = (stats: ReturnType<typeof statsSchema>, trainings: string[], spells: string[]) => {
        const perks = this.perks()
        return perks.filter(perk => isEligibleForPerk(stats, trainings, spells, perk.system))
    }

    static alchemical = () => {
        return Array.from(this.items.values())
            .filter(item => item != null && (item.visible !== false) && item.type === 'alchemical')
            .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "")) as (Item & { system: AlchemicalItemDataModel })[]
    }

    static equipment = (): (Item & { system: EquipmentDataModel<EquipmentSchema> })[] => {
        const invTypes = inventoryItemTypes()
        return Array.from(this.items.values())
            .filter(item => item != null && (item.visible !== false) && invTypes.includes(item.type))
            .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""))
            .sort((a, b) => (a.system?.category ?? "").localeCompare(b.system?.category ?? "")) as (Item & { system: EquipmentDataModel<EquipmentSchema> })[]
    }

    static sundries = (): (Item & { system: SundryDataModel })[] => {
        return Array.from(this.items.values())
            .filter(item => item != null && (item.visible !== false) && item.type === "sundry")
            .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""))
            .sort((a, b) => (a.system?.category ?? "").localeCompare(b.system?.category ?? "")) as (Item & { system: SundryDataModel })[]
    }

    static packs = (): (Item & { system: any })[] => {
        return Array.from(this.items.values())
            .filter(item => item != null && (item.visible !== false) && item.type === 'startingpack')
            .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "")) as (Item & { system: any })[]
    }

    static async updateItem(item: any) {
        if (!item) return
        const validTypes = ['spell', 'perk', 'startingpack']
        if (validTypes.includes(item.type)) {
            const fullItem = await getFullItem(item)
            if (fullItem) {
                this.items.set(fullItem.uuid, fullItem)
                this.refreshAllActors()
            }
        } else if (item.uuid) {
            this.items.set(item.uuid, item)
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
            ?.forEach(actor => (actor as any)?.system?.forceUpdate?.())
    }

}