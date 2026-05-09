import { AdversaryDataModel } from "./actor/Adversary.mjs";
import { HeroDataModel } from "./actor/Hero.mjs";

Hooks.once("init", () => {
    console.log("AHHH")
    console.log("HELLO WORLD 2")
    Object.assign(CONFIG.Actor.dataModels, {
        "hero": HeroDataModel,
        "adversary": AdversaryDataModel
    })
})