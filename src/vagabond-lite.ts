import AdversaryDataModel from "./model/actor/AdversaryDataModel"
import HeroDataModel from "./model/actor/HeroDataModel"
import ArmorDataModel from "./model/item/equip/ArmorDataModel"
import WeaponDataModel from "./model/item/equip/WeaponDataModel"
import SundryDataModel from "./model/item/equip/SundryDataModel"
import ClassDataModel from "./model/item/class/ClassDataModel"
import AncestryDataModel from "./model/item/ancestry/AncestryDataModel"
import SpellDataModel from "./model/item/spell/SpellDataModel"
import PerkDataModel from "./model/item/perk/PerkDataModel"
import NpcDataModel from "./model/actor/NpcDataModel"

import '../styles/vagabond-lite.css'

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