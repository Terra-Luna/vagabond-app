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
import GearDataModel from "./model/item/equip/GearDataModel"

Hooks.once("init", () => {
    Object.assign(
        // Actors
        CONFIG.Actor.dataModels.hero = HeroDataModel,
        CONFIG.Actor.dataModels.adversary = AdversaryDataModel,
        CONFIG.Actor.dataModels.npc = NpcDataModel,
        // Items
        CONFIG.Item.dataModels.armor = ArmorDataModel,
        CONFIG.Item.dataModels.weapon = WeaponDataModel,
        CONFIG.Item.dataModels.gear = GearDataModel,
        CONFIG.Item.dataModels.sundry = SundryDataModel,
        CONFIG.Item.dataModels.ancestry = AncestryDataModel,
        CONFIG.Item.dataModels.class = ClassDataModel,
        CONFIG.Item.dataModels.perk = PerkDataModel,
        CONFIG.Item.dataModels.spell = SpellDataModel
    )
})

export const requiredString = { required: true, nullable: false }
export const standardInteger = { integer: true, min: 0, initial: 0 }
export const requiredInteger = { required: true, integer: true, min: 0, initial: 0 }