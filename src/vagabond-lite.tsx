import AlchemicalItemDataModel from "./model/item/equip/AlchemicalItemDataModel"
import AdversaryDataModel from "./model/actor/AdversaryDataModel"
import HeroDataModel from "./model/actor/HeroDataModel"
import ClassDataModel from "./model/item/character/ClassDataModel"
import ArmorDataModel from "./model/item/equip/ArmorDataModel"
import WeaponDataModel from "./model/item/equip/WeaponDataModel"
import SundryDataModel from "./model/item/equip/SundryDataModel"
import AncestryDataModel from "./model/item/character/AncestryDataModel"
import SpellDataModel from "./model/item/character/type/SpellDataModel"
import PerkDataModel from "./model/item/character/PerkDataModel"
import NpcDataModel from "./model/actor/NpcDataModel"
import GearDataModel from "./model/item/equip/GearDataModel"
import VagabondLiteHeroSheet from "./view/sheets/VagabondLiteHeroSheet"

import '../styles/vagabond-lite.css'

Hooks.once("init", () => {
    Object.assign(
        // Actors
        CONFIG.Actor.dataModels.adversary = AdversaryDataModel,
        CONFIG.Actor.dataModels.hero = HeroDataModel,
        CONFIG.Actor.dataModels.npc = NpcDataModel,
        // Items
        CONFIG.Item.dataModels.armor = ArmorDataModel,
        CONFIG.Item.dataModels.weapon = WeaponDataModel,
        CONFIG.Item.dataModels.alchemical = AlchemicalItemDataModel,
        CONFIG.Item.dataModels.gear = GearDataModel,
        CONFIG.Item.dataModels.sundry = SundryDataModel,
        CONFIG.Item.dataModels.ancestry = AncestryDataModel,
        CONFIG.Item.dataModels.class = ClassDataModel,
        CONFIG.Item.dataModels.perk = PerkDataModel,
        CONFIG.Item.dataModels.spell = SpellDataModel
    )
})

// register sheets
foundry.documents.collections.Actors.registerSheet('vagabond-lite', VagabondLiteHeroSheet, {
    types: ['hero'],
    makeDefault: true,
})