import { createRoot } from "react-dom/client"

import { CountdownApp } from "./apps/countdown/CountdownApp"
import { ProgressClockApp } from "./apps/progress-clock/ProgressClockApp"
import { VagabondSettingsRegistry } from "./apps/vagabond-tools/VagabondSettingsRegistry"
import { VagabondToolsApp } from "./apps/vagabond-tools/VagabondToolsApp"
import { VagabondActiveEffect } from './combat/documents/VagabondActiveEffect'
import { VagabondCombat, VagabondCombatant } from './combat/documents/VagabondCombat'
import { Attack } from "./combat/engine/Attack"
import { VagabondCombatTracker } from "./combat/ui/CombatTrackerDocument"
import { AdversaryDataModel } from "./model/actor/AdversaryDataModel"
import { HeroDataModel } from "./model/actor/HeroDataModel"
import { NpcDataModel } from "./model/actor/NpcDataModel"
import { isInventoryItem } from "./model/actor/type/Inventory"
import { enforceSingletonPlaceholder } from "./model/actor/util/NpcDataModelUtil"
import { VagabondActor } from "./model/actor/VagabondActor"
import { VagabondCombatModel } from "./model/combat/VagabondCombatant"
import { ActiveEffectDataModel } from "./model/effect/ActiveEffectDataModel"
import { AncestryDataModel } from "./model/item/character/AncestryDataModel"
import { ClassDataModel } from "./model/item/character/ClassDataModel"
import { PerkDataModel } from "./model/item/character/PerkDataModel"
import { SpellDataModel } from "./model/item/character/SpellDataModel"
import { AlchemicalItemDataModel } from "./model/item/equip/AlchemicalItemDataModel"
import { ArmorDataModel } from "./model/item/equip/ArmorDataModel"
import { ContainerDataModel } from "./model/item/equip/ContainerDataModel"
import { StartingPackDataModel } from "./model/item/equip/StartingPackDataModel"
import { SundryDataModel } from "./model/item/equip/SundryDataModel"
import { WeaponDataModel } from "./model/item/equip/WeaponDataModel"
import { ItemsCache } from "./rules/util/ItemsCache"
import { stackStackables } from "./utils/heroInventoryUtil"
import { getFullItem, getId } from "./utils/modelUtil"
import { vgLiteStyles } from "./utils/styleUtils"
import { RehydratedChatCard } from "./view/chat/ChatCardRehydrator"
import { NpcSheet } from "./view/sheets/actor/adversary/AdversarySheet"
import { HeroSheet } from "./view/sheets/actor/hero/HeroSheet"
import { AncestrySheet } from "./view/sheets/item/character/ancestry/AncestrySheet"
import { ClassSheet } from "./view/sheets/item/character/class/ClassSheet"
import { PerkSheet, SpellSheet } from './view/sheets/item/character/SkillSheets'
import { EquipmentSheet } from './view/sheets/item/equip/EquipmentSheet'

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

let clocksOverlay: ProgressClockApp | null = null
let countdownOverlay: CountdownApp | null = null

Hooks.once("init", () => {
    Object.assign(
        // Actors
        CONFIG.Actor.documentClass = VagabondActor,
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
        CONFIG.Item.dataModels.startingpack = StartingPackDataModel,
        CONFIG.Item.dataModels.sundry = SundryDataModel,
        CONFIG.Item.dataModels.weapon = WeaponDataModel,
        // Combat
        CONFIG.Combat.documentClass = VagabondCombat,
        CONFIG.Combatant.documentClass = VagabondCombatant,
        CONFIG.Combatant.dataModels.base = VagabondCombatModel,
        CONFIG.ActiveEffect.documentClass = VagabondActiveEffect,
        CONFIG.statusEffects = VagabondActiveEffect.statusEffects as any,
        CONFIG.ActiveEffect.dataModels = { base: ActiveEffectDataModel as any },
        CONFIG.ui.combat = VagabondCombatTracker
    )

    foundry.applications.sidebar.tabs.CombatTracker.PARTS.tracker.template = "systems/vagabond-lite/react-placeholder.hbs"

    VagabondSettingsRegistry.register()
})

foundry.documents.collections.Actors.registerSheet('vagabond-lite', HeroSheet as any, { types: ['hero'], makeDefault: true });
foundry.documents.collections.Actors.registerSheet('vagabond-lite', NpcSheet as any, { types: ['npc'], makeDefault: true });
foundry.documents.collections.Actors.registerSheet('vagabond-lite', NpcSheet as any, { types: ['adversary'], makeDefault: true });
foundry.documents.collections.Items.registerSheet('vagabond-lite', ClassSheet as any, { types: ['class'], makeDefault: true });
foundry.documents.collections.Items.registerSheet('vagabond-lite', PerkSheet as any, { types: ['perk'], makeDefault: true });
foundry.documents.collections.Items.registerSheet('vagabond-lite', SpellSheet as any, { types: ['spell'], makeDefault: true });
foundry.documents.collections.Items.registerSheet('vagabond-lite', AncestrySheet as any, { types: ['ancestry'], makeDefault: true });
foundry.documents.collections.Items.registerSheet('vagabond-lite', EquipmentSheet as any, {
    types: [
        'alchemical', 'armor', 'container', 'startingpack', 'sundry', 'tool', 'weapon'
    ], makeDefault: true
});

Hooks.once("ready", async () => {
    game.socket?.on("system.vagabond-lite", async (packet: any) => {
        if (!game.user?.isGM) return

        const activeGM = game.users?.activeGM
        if (activeGM && activeGM.id !== game.user.id) return

        // Process snapshot and update database
        if (packet?.action === "saveAttackSnapshot") {
            const attackData = packet.data
            if (!attackData || !attackData.actorId) return
            Attack.handleIncomingAttackSnapshot(attackData)
        }
        else if (packet?.action === "updateGameSetting") {
            const data = packet.data
            if (!data || !packet.user) return
            VagabondSettingsRegistry.handleIncomingSettingsChange(data)
        }
    })

    await ItemsCache.initialize()
    game.actors?.filter(it => it.system instanceof HeroDataModel)?.forEach(actor => {
        if (actor.isOwner) {
            (actor.system as HeroDataModel).forceUpdate()
        }
        else if (actor.visible) {
            actor.sheet?.render(false)
        }
    })

    /**
     * Overlay rendering (Countdowns & Progress Clocks)
     */
    if (!clocksOverlay) { clocksOverlay = new ProgressClockApp() }
    if (!countdownOverlay) { countdownOverlay = new CountdownApp() }
    clocksOverlay.render({ force: true })
    countdownOverlay.render({ force: true })

    VagabondToolsApp.renderCanvasButton()
})

Hooks.on("preCreateItem", (item: any, _options, _userId) => {
    if (!item.parent || item.parent.documentName !== "Actor") return true

    const actor = item.parent

    /**
     * If an item's stackable, don't add another one. Instead, find
     * the existing matching item (by name) and increase its quantity.
     */
    if (actor && isInventoryItem(item)) {
        if (item.system.bulk.isStackable) {
            const stack = actor.items.find((it: any) => it.name === item.name)
            if (stack) {
                stack.update({ 'system.bulk.quantity': stack.system.bulk.quantity + item.system.bulk.quantity })
                stackStackables(item.parent.system)
                return false
            }
        }
    }

    /**
     * GMs can replace ancestries and classes, normal users can't add multiple ancestries / classes
     */
    const uniqueItemTypes = ['ancestry', 'class']
    if (uniqueItemTypes.includes(item.type)) {
        const preExistingUniqueItem = actor.items.find(i => i.type === item.type)
        if (preExistingUniqueItem) {
            if (game.user?.isActiveGM) {
                preExistingUniqueItem.update({ name: item.name, system: item.system })
                actor.system.forceUpdate?.()
            }
            return false
        }
        return true
    }

})

Hooks.on("createItem", async (item, _options, _userId) => {
    if (game.user?.id !== _userId) return

    const parent = item.parent
    const parentIsActor = parent && parent.documentName === "Actor"

    /**
     * Deal with some quirks for Foundry item sorting...
     */
    if (parentIsActor) {
        if (isInventoryItem(item)) {
            const items = parent.items
            const newSortVal = Math.max(...(items.map(function (i) { return i.sort }))) + 1000
            item.update({ 'sort': newSortVal })
        }

        if (item.system instanceof StartingPackDataModel && parent.system instanceof HeroDataModel) {
            await item.system.unpack(parent as Actor & { system: HeroDataModel })
        }
    }

    if ((item as any).type === "spell" && (item as any).type === "perk") {
        await ItemsCache.updateItem(item)
    }
})

Hooks.on("updateItem", async (item, changed, options, userId) => {
    if ("name" in changed) {
        console.info("Reinitializing ItemsCache")
        await ItemsCache.initialize()
    }

    /**
     * This will cause container sheets to refresh themselves when their
     * underlying items (ref'd by item-ID) are updated.
     */
    const actor = item.actor
    if (!actor) return
    if (actor) {
        const containers = actor.items?.filter(it => it.system instanceof ContainerDataModel)
        const container = containers.find(c => (c.system as any).itemIds.includes(getId(item)))
        if (container) {
            for (const app of foundry.applications.instances.values()) {
                const docApp = app as any
                if (docApp.document && getId(container) === docApp.document.id) {
                    docApp.render()
                }
            }
        }

        if ((item as any).type === "spell" || (item as any).type === "perk") {
            await ItemsCache.updateItem(item)
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

Hooks.on("deleteItem", async (item, options, userId) => {
    if (game.user?.id !== userId || !item.parent) return
    
    const childrenToDelete = item.parent.items.filter(
        (i: any) => i.getFlag("vagabond-lite", "grantedBy") === item.id
    ).map((i: any) => i.id)

    if (childrenToDelete.length > 0) {
        await item.parent.deleteEmbeddedDocuments("Item", childrenToDelete)
    }

    // If an item was deleted off a hero, trigger an update in case something (like their class/ancestry) just adds it back
    (item.parent.system as HeroDataModel)?.forceUpdate?.()

    if ((item as any).type === "spell" || (item as any).type === "perk") {
        await ItemsCache.updateItem(item)
    }
})

Hooks.on("updateCompendium", async (pack: any, documents: any[], options: any, userId: string) => {
    if (pack.metadata.type === "Item") {
        let cacheChanged = false
        const action = options.action || (options.parent ? "update" : "create")

        for (const doc of documents) {
            const uuid = `Compendium.${pack.collection}.Item.${doc._id}`
            /**
             * Item was newly added or modified...
             */
            if (action === "create" || action === "update") {
                const item = await fromUuid(uuid)
                if (item && ((item as any).type === "spell" || (item as any).type === "perk")) {
                    const fullItem = await getFullItem(item as any)
                    if (fullItem) {
                        ItemsCache.items.set(uuid, fullItem)
                        cacheChanged = true
                    }
                }
            }
            /**
             * Item was deleted from compendium...
             */
            else if (action === "delete") {
                if (ItemsCache.items.has(uuid)) {
                    ItemsCache.items.delete(uuid)
                    cacheChanged = true
                }
            }
        }
        /**
         * If the cache changed, this will update all Hero actors.
         */
        if (cacheChanged) {
            ItemsCache.refreshAllActors()
        }
    }
})

Hooks.on("renderActiveEffectConfig", (app: any, html: HTMLElement, context: any) => {
    const effect = app.document
    const rawName = effect?.name || ""

    /**
     * The purpose of this is to swap in the actual locale name for some of our
     * custom active effect implementations such as "Burning".
     */
    if (game.i18n?.has(rawName)) {
        const localizedString = game.i18n.localize(rawName)
        if (app.window?.title) {
            app.window.title.textContent = `Active Effect: ${localizedString}`;
        }

        const rootElement = html instanceof HTMLElement ? html : (html as any)[0]
        if (rootElement) {
            const nameInput = rootElement.querySelector('input[name="name"]') as HTMLInputElement | null
            if (nameInput && nameInput.value === rawName) {
                nameInput.value = localizedString
            }
        }
    }

    /**
     * Inject a checkbox for toggling whether the item should provide an on-equip
     * effect versus an always-on effect.
     */
    if (effect && effect.parent instanceof Item) {
        const rootElement = html instanceof HTMLElement ? html : (html as any)[0]
        const detailsTab = rootElement.querySelector('.tab[data-tab="details"]')
        if (!detailsTab) return

        const requiresEquip = effect?.system?.requiresEquip ?? true

        const formGroup = document.createElement("div")
        formGroup.classList.add("form-group")
        formGroup.innerHTML = `
            <label>On Equip</label>
            <div class="form-fields">
                <input type="checkbox" name="system.requiresEquip" ${requiresEquip ? "checked" : ""}/>
            </div>
            <p class="notes">If checked, this effect will only apply when the item is equipped.</p>
        `;

        detailsTab.appendChild(formGroup)

        if (typeof app.setPosition === "function") {
            app.setPosition({ height: "auto" })
        }
    }
})

const vagabondChatRoots = new Map<string, any>()

Hooks.on("renderChatMessageHTML", (message: foundry.documents.ChatMessage, html: HTMLElement) => {
    const renderVagabondChatMessages = () => {
        const rootElement = html.querySelector('.vagabond-react-chat-root') as HTMLElement
        if (!rootElement) return

        html.style.background = 'transparent'
        html.style.border = 'none'
        html.style.boxShadow = 'none'
        html.style.padding = '0'
        const coreHeader = html.querySelector('.message-header') as HTMLElement
        if (coreHeader) coreHeader.style.display = 'none'

        const blueprint = message.getFlag("vagabond-lite" as any, "blueprint")
        if (!blueprint) return

        let scaduRoot = rootElement.shadowRoot
        let root = vagabondChatRoots.get(message?.id ?? '')

        if (!scaduRoot) {
            scaduRoot = rootElement.attachShadow({ mode: 'open' })

            const styleTag = document.createElement('style')
            styleTag.textContent = vgLiteStyles
            scaduRoot.appendChild(styleTag)

            const reactContainer = document.createElement('div')
            scaduRoot.appendChild(reactContainer)

            root = createRoot(reactContainer)
            vagabondChatRoots.set(message?.id ?? '', root)
        }

        const appThemeClass = (game.settings as any).get("core", "uiConfig")?.colorScheme?.applications ?? 'theme-dark'

        root.render(
            <div className={`${appThemeClass}`}>
                <RehydratedChatCard blueprint={blueprint} messageId={message?.id ?? ''} />
            </div>
        )
    }

    const checkStateAndRender = () => {
        if (ItemsCache.items.size > 0) {
            renderVagabondChatMessages()
        } else {
            Hooks.once("onItemsCacheInitialized" as any, () => {
                renderVagabondChatMessages()
            })
        }
    }

    if (canvas?.ready || !game.scenes?.active) {
        checkStateAndRender()
    } else {
        Hooks.once("canvasReady", () => {
            checkStateAndRender()
        })
    }
})

Hooks.on("deleteChatMessage", (message: any) => {
    if (vagabondChatRoots.has(message.id)) {
        try { vagabondChatRoots.get(message.id).unmount(); } catch (e) { /* no-op */ }
        vagabondChatRoots.delete(message.id);
    }
});

Hooks.on("dropCanvasData", (canvas: Canvas, data: Record<string, any>): boolean | void => {
    if (data.type !== "Actor" || !data.uuid || !data.uuid.startsWith("Compendium.")) return true

    /**
     * The following will prevent duplicate Adversary Actors from being
     * created in the world database when dragging them from a compendium
     * to the canvas (default Foundry behavior).
     */
    const parts = data.uuid.split(".")
    const packId = `${parts[1]}.${parts[2]}`
    const actorId = parts[4]

    const pack = game.packs?.get(packId)
    const indexEntry = pack?.index?.get(actorId) as any

    if (!indexEntry || indexEntry.type !== "adversary") return true

    enforceSingletonPlaceholder(data, canvas)
    return false
});