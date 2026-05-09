import { AdversaryDataModel } from "./model/actor/Adversary.mjs"
import { HeroDataModel } from "./model/actor/Hero.mjs"

Hooks.once("init", () => {
    console.log("HELLO WORLD")
    Object.assign(
        CONFIG.Actor.dataModels, {
            "hero": HeroDataModel,
            "adversary": AdversaryDataModel
        }
    )
})