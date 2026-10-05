import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { ItemsCache } from "../../rules/util/ItemsCache"

export interface VagabondAPI {
    version: string
    rules: {
        toggleEffect: (actor: Actor & { system: HeroDataModel }, itemId: string, stateOverride?: boolean) => void
    }
}

export const api: VagabondAPI = {
    version: "1.0.0",

    rules: {
        toggleEffect: (actor: Actor & { system: HeroDataModel }, itemId: string, stateOverride?: boolean) => {
            const item = ItemsCache.allItems().find(it => it.id === itemId.split('.').pop())
            if (item) {
                actor.system.toggleItemRule(item, stateOverride)
            }
            else {
                ui.notifications?.error(`Item with ID ${itemId} not found.`)
            }
        }
    }
    
}