import AdversaryDataModel from "./model/actor/AdversaryDataModel.mjs"
import HeroDataModel from "./model/actor/HeroDataModel.mjs"
import ArmorDataModel from "./model/item/equip/ArmorDataModel.mjs"
import WeaponDataModel from "./model/item/equip/WeaponDataModel.mjs"
import SundryDataModel from "./model/item/equip/SundryDataModel.mjs"

Hooks.once("init", () => {
    console.log("HELLO WORLD")
    Object.assign(
        CONFIG.Actor.dataModels, { "hero": HeroDataModel, "adversary": AdversaryDataModel },
        CONFIG.Item.dataModels, { "armor": ArmorDataModel, "weapon": WeaponDataModel, "sundry": SundryDataModel }
    )
})