import { CombinedItemsMultiType, getFullItem } from "../../utils/modelUtil"

export class RulesCache {
    static items = new Map<string, any>()

    /**
     * Initialize a cache by pre-fetching rules-eligible items so the Hero's
     * prepareDerivedData function isn't running async operations.
     */
    static async initialize() {
        this.items.clear()

        const allItems = await CombinedItemsMultiType(['spell', 'perk']);

        for (const item of allItems) {
            const fullItem = await getFullItem(item)
            if (fullItem) {
                this.items.set(fullItem.uuid, fullItem)
            }
        }
        console.log("Vagabond Lite | Item Rules Cache Initialized:", this.items.size, "Items")
    }
}