import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { ItemsCache } from "../../rules/util/ItemsCache"
import { VagabondAppArgs,VagabondApplication } from "../VagabondApplication"
import { AlchemyCraftingView } from "./AlchemyCraftingView"

export class AlchemyCraftingApp extends VagabondApplication {

    actor: Actor & { system: HeroDataModel }
    isLevelUp?: boolean
    alchemyItems = ItemsCache.alchemical()

    constructor(actor: Actor & { system: HeroDataModel }) {
        super({
            window: { title: "Alchemy Crafting" },
            position: { width: 400 },
            Component: AlchemyCraftingView
        } as VagabondAppArgs)
        
        this.actor = actor
    }

    override getReactProps() {
        return {
            ...super.getReactProps(),
            actor: this.actor
        }
    }

}