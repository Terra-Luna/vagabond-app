import AlchemicalItemDataModel from "./model/item/equip/AlchemicalDataModel"
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
import { AncestrySheet } from "./view/sheets/item/character/AncestrySheet"
import { VgLiteCombat, VgLiteCombatant } from './combat/VgLiteCombat'
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

Hooks.on("renderCombatTracker", (app, html, data) => {
    $(html).find('.combatant').each((_: any, li: any) => {
        const actorId = $(li).attr('data-combatant-id')
        const combatant = Array.from(game.combat?.combatants).find(it => it._id === actorId) as VgLiteCombatant
        $(li).find('.token-initiative').replaceWith(`<div class="vglite-take-init-btn">GO</div>`)
        /**
         * TODO: 
         * If combatant.activations > 0, vglite-take-init-btn onClick should call VgLiteCombat.activateCombatant().
         * Then become an END button with a square shape. If actor is out of activations, their row in the tracker
         * should be dimmed and no button should be available.
         * Finally, GM should be able to reset their activation via r-click context menu??
         */
    })
})

// Register sheets
foundry.documents.collections.Actors.registerSheet('vagabond-lite', HeroSheet, {
    types: ['hero'],
    makeDefault: true
})

foundry.documents.collections.Items.registerSheet('vagabond-lite', PerkSheet, {
    types: ['perk'],
    makeDefault: true
})

foundry.documents.collections.Items.registerSheet('vagabond-lite', AncestrySheet, {
    types: ['ancestry'],
    makeDefault: true
})