import { AdversaryDataModel } from "./model/actor/AdversaryDataModel.mjs"
import { HeroDataModel } from "./model/actor/HeroDataModel.mjs"

Hooks.once("init", () => {
    console.log("HELLO WORLD")
    Object.assign(
        CONFIG.Actor.dataModels, {
            "hero": HeroDataModel,
            "adversary": AdversaryDataModel
        }
    )
})