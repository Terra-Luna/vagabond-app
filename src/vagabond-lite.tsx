import '../public/styles/vagabond-lite.css'
import AlchemicalItemDataModel from "./model/item/equip/AlchemicalItemDataModel"
import AdversaryDataModel from "./model/actor/AdversaryDataModel"
import HeroDataModel from "./model/actor/HeroDataModel"
import ClassDataModel from "./model/item/character/ClassDataModel"
import ArmorDataModel from "./model/item/equip/ArmorDataModel"
import WeaponDataModel from "./model/item/equip/WeaponDataModel"
import SundryDataModel from "./model/item/equip/SundryDataModel"
import AncestryDataModel from "./model/item/character/AncestryDataModel"
import SpellDataModel from "./model/item/character/SpellDataModel"
import PerkDataModel from "./model/item/character/PerkDataModel"
import NpcDataModel from "./model/actor/NpcDataModel"
import ToolDataModel from "./model/item/equip/ToolDataModel"
import HeroSheet from "./view/sheets/actor/hero/HeroSheet"
import StarterPackDataModel from "./model/item/equip/StarterPackDataModel"
import ContainerDataModel from "./model/item/equip/ContainerDataModel"
import { PerkSheet } from "./view/sheets/item/character/PerkSheet"
import { VgLiteCombat, VgLiteCombatant } from './combat/spellcasting/VgLiteCombat'
import VgLiteActiveEffect from './document/VgLiteActiveEffect'

Hooks.once("init", () => {
    Object.assign(
        // Actors
        CONFIG.Actor.dataModels.adversary = AdversaryDataModel,
        CONFIG.Actor.dataModels.hero = HeroDataModel,
        CONFIG.Actor.dataModels.npc = NpcDataModel,
        // Items
        CONFIG.Item.dataModels.container = ContainerDataModel,
        CONFIG.Item.dataModels.armor = ArmorDataModel,
        CONFIG.Item.dataModels.weapon = WeaponDataModel,
        CONFIG.Item.dataModels.alchemical = AlchemicalItemDataModel,
        CONFIG.Item.dataModels.tool = ToolDataModel,
        CONFIG.Item.dataModels.sundry = SundryDataModel,
        CONFIG.Item.dataModels.starterPack = StarterPackDataModel,
        CONFIG.Item.dataModels.ancestry = AncestryDataModel,
        CONFIG.Item.dataModels.class = ClassDataModel,
        CONFIG.Item.dataModels.perk = PerkDataModel,
        CONFIG.Item.dataModels.spell = SpellDataModel,
        // Combat
        CONFIG.Combat.documentClass = VgLiteCombat,
        CONFIG.Combatant.documentClass = VgLiteCombatant,
        CONFIG.ActiveEffect.documentClass = VgLiteActiveEffect,
    )
})

// register sheets
foundry.documents.collections.Actors.registerSheet('vagabond-lite', HeroSheet, {
    types: ['hero'],
    makeDefault: true
})

foundry.documents.collections.Items.registerSheet('vagabond-lite', PerkSheet, {
    types: ['perk'],
    makeDefault: true
})