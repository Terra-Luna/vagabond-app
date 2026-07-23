import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { CombinedItemsMultiType, getFullItem } from "../../utils/modelUtil"

export class RulesCache {
    /**
     * A cache of compendium + world items by uuid and item data.
     */
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