import { AlchemicalItemDataModel } from "./model/item/equip/AlchemicalItemDataModel"
import { AdversaryDataModel } from "./model/actor/AdversaryDataModel"
import { HeroDataModel } from "./model/actor/HeroDataModel"
import { ClassDataModel } from "./model/item/character/ClassDataModel"
import { ArmorDataModel } from "./model/item/equip/ArmorDataModel"
import { WeaponDataModel } from "./model/item/equip/WeaponDataModel"
import { SundryDataModel } from "./model/item/equip/SundryDataModel"
import { AncestryDataModel } from "./model/item/character/AncestryDataModel"
import { SpellDataModel } from "./model/item/character/SpellDataModel"
import { PerkDataModel } from "./model/item/character/PerkDataModel"
import { NpcDataModel } from "./model/actor/NpcDataModel"
import { ToolDataModel } from "./model/item/equip/ToolDataModel"
import { HeroSheet } from "./view/sheets/actor/hero/HeroSheet"
import { StarterPackDataModel } from "./model/item/equip/StarterPackDataModel"
import { ContainerDataModel } from "./model/item/equip/ContainerDataModel"
import { AncestrySheet } from "./view/sheets/item/character/ancestry/AncestrySheet"
import { VgLiteCombat, VgLiteCombatant } from './combat/VgLiteCombat'
import { VgLiteActiveEffect } from './document/VgLiteActiveEffect'
import { isInventoryItem } from "./model/actor/type/Inventory"
import { runAllMacros } from "./macro/all-macros"
import { AdversarySheet } from "./view/sheets/actor/adversary/AdversarySheet"
import { createRoot } from "react-dom/client"
import { EquipmentSheet } from './view/sheets/item/equip/EquipmentSheet'
import { PerkSheet, SpellSheet } from './view/sheets/item/character/SkillSheets'
import { vgLiteStyles } from "./utils/styleUtils"
import { getId } from "./utils/modelUtil"
import { ClassSheet } from "./view/sheets/item/character/class/ClassSheet"
import { stackStackables } from "./utils/heroInventoryUtil"
import { rehydrateElement } from "./view/chat/ChatCardRehydrator"

// Add our fonts
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

Hooks.on("preCreateItem", (item: any, _options, _userId) => {
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
     * Prevent adding duplicate perks and spells (unless the perk can be taken multiple times).
     */
    if (item.type === 'perk') {
        return item.system.canTakeMultiple || !actor.item.some(i => i.type === 'perk' && i.name === item.name)
    }

    if (item.type === 'spell') {
        return !actor.items.some(i => i.type === 'spell' && i.name === item.name)
    }

    if (isInventoryItem(item) && item.system.bulk.isStackable) {
        const stack = actor.items.find((it: any) => it.name === item.name)
        if (stack != undefined) {
            stack.update({ 'system.bulk.quantity': stack.system.bulk.quantity + 1 })
            stackStackables(item.parent.system)
            return false
        }
    }
})

Hooks.on("createItem", (item, _options, _userId) => {
    if (!item.parent || item.parent.documentName !== "Actor") return
    if (isInventoryItem(item)) {
        const items = item.parent.items
        const newSortVal = Math.max(...(items.map(function (i) { return i.sort }))) + 1000
        item.update({ 'sort': newSortVal })
    }
})

Hooks.on("updateItem", (item, changed, options, userId) => {
    const actor = item.actor
    if (!actor) return

    /**
     * This will cause container sheets to refresh themselves when their
     * underyling items (ref'd by item-ID) are updated.
     */
    const containers = actor.items?.filter(it => it.system instanceof ContainerDataModel)
    const container = containers.find(c => (c.system as any).itemIds.includes(getId(item)))
    if (!container) return
    for (const app of foundry.applications.instances.values()) {
        const docApp = app as any
        if (docApp.document && getId(container) === docApp.document.id) {
            docApp.render()
        }
    }
})

Hooks.on("preDeleteItem", (item: any, _options, _userId) => {
    if (item.system.bulk?.isStackable && item.parent) {
        const count = item.system.bulk.quantity
        if (count > 1) {
            item.update({ 'system.bulk.quantity': count - 1 })
            return false
        }
    }
    return true
})

Hooks.on("renderCombatTracker", (_app, html, _data) => {
    $(html).find('.combatant').each((_: any, li: any) => {
        // commented out for eslint
        //const actorId = $(li).attr('data-combatant-id')
        //const combatant = Array.from(game.combat?.combatants as any)?.find(it => getId(it) === actorId) as VgLiteCombatant
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
                <style>{vgLiteStyles}</style>
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

/* Hooks.on("targetToken", (user, token, targeted) => {
    if (!game.user || user.id !== game.user.id) return
    if (targeted) {
        console.log(`You targeted: ${token.name}`)
    }
    else {
        console.log(`You untargeted: ${token.name}`)
    }
}) */

foundry.documents.collections.Actors.registerSheet('vagabond-lite', HeroSheet as any, {
    types: ['hero'],
    makeDefault: true
});

foundry.documents.collections.Actors.registerSheet('vagabond-lite', AdversarySheet as any, {
    types: ['adversary'],
    makeDefault: true
});

foundry.documents.collections.Items.registerSheet('vagabond-lite', ClassSheet as any, {
    types: ['class'],
    makeDefault: true
});

foundry.documents.collections.Items.registerSheet('vagabond-lite', PerkSheet as any, {
    types: ['perk'],
    makeDefault: true
});

foundry.documents.collections.Items.registerSheet('vagabond-lite', SpellSheet as any, {
    types: ['spell'],
    makeDefault: true
});

foundry.documents.collections.Items.registerSheet('vagabond-lite', AncestrySheet as any, {
    types: ['ancestry'],
    makeDefault: true
});

foundry.documents.collections.Items.registerSheet('vagabond-lite', EquipmentSheet as any, {
    types: ['alchemical', 'armor', 'container', 'starterpack', 'sundry', 'tool', 'weapon'],
    makeDefault: true
});

(window as any).runVgLiteDebugMacros = runAllMacros