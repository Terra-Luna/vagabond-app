import AdversaryDataModel from "./model/actor/AdversaryDataModel.mjs"
import HeroDataModel from "./model/actor/HeroDataModel.mjs"
import ArmorDataModel from "./model/item/equip/ArmorDataModel.mjs"
import WeaponDataModel from "./model/item/equip/WeaponDataModel.mjs"
import SundryDataModel from "./model/item/equip/SundryDataModel.mjs"
import ClassDataModel from "./model/item/class/ClassDataModel.mjs"
import AncestryDataModel from "./model/item/ancestry/AncestryDataModel.mjs"
import SpellDataModel from "./model/item/spell/SpellDataModel.mjs"
import PerkDataModel from "./model/item/perk/PerkDataModel.mjs"
import NpcDataModel from "./model/actor/NpcDataModel.mjs"

Hooks.once("init", () => {
    console.log("HELLO WORLD")
    Object.assign(
        CONFIG.Actor.dataModels,
        {
            "hero": HeroDataModel,
            "adversary": AdversaryDataModel,
            "npc": NpcDataModel
        },
        CONFIG.Item.dataModels,
        {
            "armor": ArmorDataModel,
            "weapon": WeaponDataModel,
            "sundry": SundryDataModel,
            "ancestry": AncestryDataModel,
            "class": ClassDataModel,
            "perk": PerkDataModel,
            "spell": SpellDataModel
        }
    )
})

export const requiredString = { required: true, nullable: false }
export const standardInteger = { integer: true, min: 0, initial: 0 }
export const requiredInteger = { required: true, integer: true, min: 0, initial: 0 }