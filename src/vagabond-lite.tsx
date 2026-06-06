import AlchemicalItemDataModel from "./model/item/equip/AlchemicalDataModel"
import AdversaryDataModel from "./model/actor/AdversaryDataModel"
import HeroDataModel from "./model/actor/HeroDataModel"
import ClassDataModel from "./model/item/character/ClassDataModel"
import ArmorDataModel from "./model/item/equip/ArmorDataModel"
import WeaponDataModel from "./model/item/equip/WeaponDataModel"
import SundryDataModel from "./model/item/equip/SundryDataModel"
import AncestryDataModel, { applyAncestralTraits } from "./model/item/character/AncestryDataModel"
import SpellDataModel from "./model/item/character/SpellDataModel"
import PerkDataModel from "./model/item/character/PerkDataModel"
import NpcDataModel from "./model/actor/NpcDataModel"
import ToolDataModel from "./model/item/equip/ToolDataModel"
import HeroSheet from "./view/sheets/actor/hero/HeroSheet"
import StarterPackDataModel from "./model/item/equip/StarterPackDataModel"
import ContainerDataModel from "./model/item/equip/ContainerDataModel"
import { PerkSheet } from "./view/sheets/item/character/PerkSheet"
import { AncestrySheet } from "./view/sheets/item/character/ancestry/AncestrySheet"
import { VgLiteCombat, VgLiteCombatant } from './combat/VgLiteCombat'
import VgLiteActiveEffect from './document/VgLiteActiveEffect'

// add our fonts
// add our fonts
const fontFaces = [
    new FontFace(
        'Eskapade',
        'url("systems/vagabond-lite/assets/fonts/eskapade-black.ttf")',
        { weight: 'bold', style: 'normal', }
    ),
    new FontFace(
        'Eskapade',
        'url("systems/vagabond-lite/assets/fonts/eskapade-regular.ttf")',
        { weight: 'normal', style: 'normal', }
    ),
    new FontFace(
        'Paradigm',
        'url("systems/vagabond-lite/assets/fonts/paradigm-regular.otf")',
        { weight: 'normal', style: 'normal', }
    ),
    new FontFace(
        'Paradigm',
        'url("systems/vagabond-lite/assets/fonts/paradigm-bold.otf")',
        { weight: 'bold', style: 'normal', }
    ),
];

(await Promise.all(fontFaces.map(face => face.load()))).forEach(
    font => document.fonts.add(font)
)

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

Hooks.on("preCreateItem", (item: any, options, userId) => {
    if (!item.parent || item.parent.documentName !== "Actor") return

    const actor = item.parent

    /**
     * Prevent adding additional ancestry and class.
     */
    const uniqueItemTypes = ['ancestry', 'class']
    if (uniqueItemTypes.indexOf(item.type) > -1 && actor.items.find((i: { type: string }) => i.type === item.type)) {
        console.log("Cannot add another", item.type)
        return false
    }

    /**
     * Prevent adding duplicate perks and spells.
     */
    const uniqueItems = ['perk', 'spell']
    if (uniqueItems.indexOf(item.type) > -1 && actor.items.find((i: { type: any; name: any }) => i.type === item.type && i.name === item.name)) {
        console.log("Already has:", item.type, item.name)
        return false
    }
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

Hooks.on("renderItemSheetV2", (_, html) => {
    $(html).find('[data-action="close"]').each((_: any, btn: HTMLElement) => {
        console.log({ btn })
        btn.onclick = (e) => {
            alert("Perish")
            // e.stopPropagation(); e.preventDefault();
        }
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