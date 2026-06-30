// @ts-ignore
import vgliteStyles from '../public/styles/vagabond-lite.css?inline'
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
import { AncestrySheet } from "./view/sheets/item/character/ancestry/AncestrySheet"
import { VgLiteCombat, VgLiteCombatant } from './combat/VgLiteCombat'
import VgLiteActiveEffect from './document/VgLiteActiveEffect'
import { isInventoryItem, stackStackables } from "./model/actor/type/Inventory"
import { runAllMacros } from "./macro/all-macros"
import { getId } from "./utils/modelUtil"
import AdversarySheet from "./view/sheets/actor/adversary/AdversarySheet"
import { createRoot } from "react-dom/client"
import { rehydrateElement } from "./view/chat/ChatCardManager"
import { SkillCheckChatCard } from "./view/chat/SkillCheckChatCard"
import { TrackerUpdateChatCard } from "./view/chat/TrackerUpdateChatCard"
import { AbilityChatCard, ComboChatCard } from './view/chat/AbilityChatCard'
import { DamageRollChatCard } from './view/chat/DamageRollChatCard'
import { ItemChatCard } from './view/chat/ItemChatCard'
import { EquipmentSheet } from './view/sheets/item/equip/EquipmentSheet'

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
        CONFIG.Item.dataModels.alchemical = AlchemicalItemDataModel,
        CONFIG.Item.dataModels.ancestry = AncestryDataModel,
        CONFIG.Item.dataModels.armor = ArmorDataModel,
        CONFIG.Item.dataModels.container = ContainerDataModel,
        CONFIG.Item.dataModels.class = ClassDataModel,
        CONFIG.Item.dataModels.perk = PerkDataModel,
        CONFIG.Item.dataModels.spell = SpellDataModel,
        CONFIG.Item.dataModels.starterPack = StarterPackDataModel,
        CONFIG.Item.dataModels.sundry = SundryDataModel,
        CONFIG.Item.dataModels.tool = ToolDataModel,
        CONFIG.Item.dataModels.weapon = WeaponDataModel,
        // Combat
        CONFIG.Combat.documentClass = VgLiteCombat,
        CONFIG.Combatant.documentClass = VgLiteCombatant,
        CONFIG.ActiveEffect.documentClass = VgLiteActiveEffect
    )
})

Hooks.on("updateActor", async (actor, updateData, options, userId) => {
    const hpValue = foundry.utils.getProperty(updateData, "system.health.current") as number | undefined
    if (hpValue == null) return
    const isDead = actor.statuses.has("dead")
    if (hpValue <= 0) {
        if (!isDead) {
            await actor.toggleStatusEffect("dead", { active: true, overlay: true })
        }
    }
    else {
        if (isDead) {
            await actor.toggleStatusEffect("dead", { active: false, overlay: false })
        }
    }
})

Hooks.on("preCreateItem", (item: any, options, userId) => {
    if (!item.parent || item.parent.documentName !== "Actor") return

    const actor = item.parent

    /**
     * Prevent adding additional ancestry and class.
     */
    const uniqueItemTypes = ['ancestry', 'class']
    if (uniqueItemTypes.indexOf(item.type) > -1 && actor.items.find((i: { type: string }) => i.type === item.type)) {
        return false
    }

    /**
     * Prevent adding duplicate perks and spells.
     */
    const uniqueItems = ['perk', 'spell']
    if (uniqueItems.indexOf(item.type) > -1 && actor.items.find((i: { type: any; name: any }) => i.type === item.type && i.name === item.name)) {
        return false
    }

    if (isInventoryItem(item) && item.system.isStackable) {
        const stack = actor.items.find((it: any) => it.name === item.name)
        if (stack != undefined) {
            stack.update({ 'system.bulk.quantity': stack.system.bulk.quantity + 1 })
            stackStackables(item.parent.system)
            return false
        }
    }
})

Hooks.on("createItem", (item, options, userId) => {
    if (!item.parent || item.parent.documentName !== "Actor") return
    if (isInventoryItem(item)) {
        const items = item.parent.items
        const newSortVal = Math.max.apply(Math, items.map(function (i) { return i.sort })) + 1000
        item.update({ 'sort': newSortVal })
    }
})

Hooks.on("preDeleteItem", (item: any, options, userId) => {
    if (item.system.isStackable && item.parent) {
        const count = item.system.bulk.quantity
        if (count > 1) {
            item.update({ 'system.bulk.quantity': count - 1 })
            return false
        }
    }
    return true
})

Hooks.on("renderCombatTracker", (app, html, data) => {
    $(html).find('.combatant').each((_: any, li: any) => {
        const actorId = $(li).attr('data-combatant-id')
        const combatant = Array.from(game.combat?.combatants as any)?.find(it => getId(it) === actorId) as VgLiteCombatant
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
        /* btn.onclick = (e) => {
            
        } */
    })
})

Hooks.on("renderChatMessageHTML", (message: foundry.documents.ChatMessage, html: HTMLElement) => {
    const renderVgLiteChatMessages = () => {
        const rootElement = html.querySelector('.vglite-react-chat-root') as HTMLElement
        if (!rootElement) return

        const blueprint = message.getFlag("vagabond-lite" as any, "blueprint")
        if (!blueprint) return

        const scaduRoot = rootElement.attachShadow({ mode: 'open' })
        const root = createRoot(scaduRoot)

        root.render(
            <div>
                <style>{vgliteStyles}</style>
                <div className={`${(game.settings as any).get("core", "uiConfig").colorScheme.applications}`}>
                    {rehydrateElement(blueprint)}
                </div>
            </div>
        )
    }

    if (canvas?.ready) {
        renderVgLiteChatMessages()
    }
    else {
        Hooks.once("canvasReady", () => {
            renderVgLiteChatMessages()
        })
    }

})

// @ts-ignore
foundry.documents.collections.Actors.registerSheet('vagabond-lite', HeroSheet, {
    types: ['hero'],
    makeDefault: true
});

// @ts-ignore
foundry.documents.collections.Actors.registerSheet('vagabond-lite', AdversarySheet, {
    types: ['adversary'],
    makeDefault: true
});

// @ts-ignore
foundry.documents.collections.Items.registerSheet('vagabond-lite', PerkSheet, {
    types: ['perk'],
    makeDefault: true
});

// @ts-ignore
foundry.documents.collections.Items.registerSheet('vagabond-lite', AncestrySheet, {
    types: ['ancestry'],
    makeDefault: true
});

// @ts-ignore
foundry.documents.collections.Items.registerSheet('vagabond-lite', EquipmentSheet, {
    types: ['alchemical', 'armor', 'weapon', 'tool', 'sundry', 'container', 'starterPack'],
    makeDefault: true
});

(window as any).runVgLiteDebugMacros = runAllMacros

export const ComponentRegistry = {
    "AbilityChatCard": AbilityChatCard,
    "ComboChatCard": ComboChatCard,
    "DamageRollChatCard": DamageRollChatCard,
    "ItemChatCard": ItemChatCard,
    "SkillCheckChatCard": SkillCheckChatCard,
    "TrackerUpdateChatCard": TrackerUpdateChatCard
}