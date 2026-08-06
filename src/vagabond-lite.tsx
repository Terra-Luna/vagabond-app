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
import { VgLiteCombat, VgLiteCombatant } from './combat/documents/VgLiteCombat'
import { VgLiteActiveEffect } from './combat/documents/VgLiteActiveEffect'
import { isInventoryItem } from "./model/actor/type/Inventory"
import { AdversarySheet } from "./view/sheets/actor/adversary/AdversarySheet"
import { createRoot } from "react-dom/client"
import { EquipmentSheet } from './view/sheets/item/equip/EquipmentSheet'
import { PerkSheet, SpellSheet } from './view/sheets/item/character/SkillSheets'
import { vgLiteStyles } from "./utils/styleUtils"
import { getFullItem, getId } from "./utils/modelUtil"
import { ClassSheet } from "./view/sheets/item/character/class/ClassSheet"
import { stackStackables } from "./utils/heroInventoryUtil"
import { RehydratedChatCard } from "./view/chat/ChatCardRehydrator"
import { VgLiteCombatTracker } from "./combat/ui/CombatTrackerDocument"
import { VgLiteActor } from "./model/actor/VgLiteActor"
import { VGLiteCombatantModel } from "./model/combat/VgLiteCombatant"
import { vgLiteLang } from "./utils/lang"
import { ActiveEffectDataModel } from "./model/effect/ActiveEffectDataModel"
import { ItemsCache } from "./rules/util/ItemsCache"
import { XpQuestionnaireConfigApp } from "./apps/level-up/questionnaire/XpQuestionnaireConfigApp"
import { Attack } from "./combat/engine/Attack"

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
        CONFIG.Actor.documentClass = VgLiteActor,
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
        CONFIG.Item.dataModels.starterpack = StarterPackDataModel,
        CONFIG.Item.dataModels.sundry = SundryDataModel,
        CONFIG.Item.dataModels.tool = ToolDataModel,
        CONFIG.Item.dataModels.weapon = WeaponDataModel,
        // Combat
        CONFIG.Combat.documentClass = VgLiteCombat,
        CONFIG.Combatant.documentClass = VgLiteCombatant,
        CONFIG.Combatant.dataModels.base = VGLiteCombatantModel,
        CONFIG.ActiveEffect.documentClass = VgLiteActiveEffect,
        CONFIG.statusEffects = VgLiteActiveEffect.statusEffects as any,
        CONFIG.ActiveEffect.dataModels = { base: ActiveEffectDataModel as any },
        CONFIG.ui.combat = VgLiteCombatTracker
    )

    foundry.applications.sidebar.tabs.CombatTracker.PARTS.tracker.template = "systems/vagabond-lite/react-placeholder.hbs"

    game.settings?.register("vagabond-lite" as any, "xp-questionnaire" as any, {
        name: "XP Questionnaire",
        hint: "An array of questions and their XP values.",
        scope: "world",
        config: false,
        type: Object,
        default: [
            { id: "q1", text: "Did you complete a Quest?", xp: 1 },
            { id: "q2", text: "Did you Fail and allow the Fail to resolve?", xp: 1 },
            { id: "q3", text: "Did you pass a Hindered Check?", xp: 1 },
            { id: "q4", text: "Did you make a discovery?", xp: 1 },
            { id: "q5", text: "Did you loot at least 50g of treasure?", xp: 1 }
        ] as any
    });

    game.settings?.registerMenu("vagabond-lite", "configureMenu", {
        name: "XP Questionnaire Editor",
        label: "Modify Questions",
        hint: "Add, remove, or edit the XP questionnaire.",
        icon: "fas fa-tasks",
        type: XpQuestionnaireConfigApp,
        restricted: true
    });

    (game.settings as any).register("vagabond-lite", "attackRegistry", {
        name: "Attack Registry",
        hint: "Stores attack data from Heros and Adversaries",
        scope: "world",
        config: false,
        type: Object,
        default: {}
    });

})

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

        if (item.system instanceof StarterPackDataModel && parent.system instanceof HeroDataModel) {
            await item.system.unpack(parent as Actor & { system: HeroDataModel })
        }
    }

    if ((item as any).type === "spell" && (item as any).type === "perk") {
        await ItemsCache.updateItem(item)
    }
})

Hooks.on("updateItem", async (item, changed, options, userId) => {
    const actor = item.actor
    if (!actor) return

    /**
     * This will cause container sheets to refresh themselves when their
     * underlying items (ref'd by item-ID) are updated.
     */
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

    if ((item as any).type === "spell" && (item as any).type === "perk") {
        await ItemsCache.updateItem(item)
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

    if ((item as any).type === "spell" && (item as any).type === "perk") {
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

Hooks.on("preCreateActiveEffect", (effect: any, data: any, options: any, userId: string) => {
    if (userId !== game.userId) return
    const actor = options.parent || effect.parent
    if (!actor) return

    const incomingChanges = data.system?.changes || effect.system?.changes || []
    const isBurningEffect = incomingChanges.find((c: any) => c.key === "system.statuses.stacks.burning")

    /**
     * The burning status can stack, but each instance MUST be of a different damage type...
     */
    if (isBurningEffect) {
        const changeValue = isBurningEffect.value || {}
        const incomingDuration = changeValue.duration || "Cd4"
        const incomingDmgType = changeValue.damageType || "fire"

        if (Array.isArray(actor.effects?.contents)) {
            const existingBurnEffect = actor.effects.contents.find((eff: any) => {
                // Check whether the actor is already Burning.
                const hasStatus = eff.statuses?.has("burning") || eff.id === "burning" || eff.key === "burning"
                if (eff.disabled || !hasStatus || eff.id === data._id) return false

                const activeChanges = eff.system?.changes || eff.changes || []
                const existingChange = activeChanges.find((c: any) => c.key === "system.statuses.stacks.burning")
                if (!existingChange?.value) return false

                const val = existingChange.value
                if (typeof val === "object" && val !== null) {
                    return val.damageType === incomingDmgType
                }

                try {
                    return JSON.parse(val).damageType === incomingDmgType
                }
                catch {
                    return false
                }
            })

            const getDieSize = (str: string): number => {
                if (typeof str !== "string") return 4 // default to 4, lowest possible countdown die.
                const match = str.match(/Cd(\d+)/i)
                return match && match[1] ? parseInt(match[1], 10) : 4
            }

            /**
             * If it's a new burning effect of a unique damage type, add it like normal, else
             * check whether the existing instance needs to be overwritten.
             */
            if (existingBurnEffect) {
                /**
                 * Apply the effect only if the incoming countdown die is larger than the original, else abort.
                 */
                try {
                    const activeChanges = existingBurnEffect.system?.changes || existingBurnEffect.changes || []
                    const existingChange = activeChanges.find((c: any) => c.key === "system.statuses.stacks.burning")
                    const val = existingChange.value

                    let existingDuration = "Cd4"
                    if (typeof val === "object" && val !== null) {
                        existingDuration = val.duration || "Cd4"
                    }
                    else {
                        existingDuration = JSON.parse(val).duration || "Cd4"
                    }

                    const existingSize = getDieSize(existingDuration)

                    if (getDieSize(incomingDuration) > existingSize) {
                        existingBurnEffect.delete()
                        ui.notifications?.info(`Upgraded ${incomingDmgType} burn from ${existingDuration} to ${incomingDuration}!`)
                        effect.updateSource({ statuses: ["burning"] })
                    } else {
                        ui.notifications?.info(`Target already ${vgLiteLang.StatusConditions.burning.name} from ${vgLiteLang.DamageTypes[incomingDmgType]} (${existingDuration}).`)
                        return false
                    }
                }
                catch (err) {
                    console.error("VGLite | Error evaluating existing burning instance object mapping:", err)
                }
            }
            else {
                effect.updateSource({ statuses: ["burning"] })
            }
        }
    }
})

Hooks.on("renderChatMessageHTML", (message: foundry.documents.ChatMessage, html: HTMLElement) => {
    const renderVgLiteChatMessages = () => {
        const rootElement = html.querySelector('.vglite-react-chat-root') as HTMLElement
        if (!rootElement) return

        const blueprint = message.getFlag("vagabond-lite" as any, "blueprint")
        if (!blueprint) return

        let scaduRoot = rootElement.shadowRoot
        let root = (rootElement as any)._reactRoot

        if (!scaduRoot) {
            scaduRoot = rootElement.attachShadow({ mode: 'open' })

            const styleTag = document.createElement('style')
            styleTag.textContent = vgLiteStyles
            scaduRoot.appendChild(styleTag)

            const reactContainer = document.createElement('div')
            scaduRoot.appendChild(reactContainer)

            root = createRoot(reactContainer);
            (rootElement as any)._reactRoot = root
        }

        root.render(
            <div key={message.id} className={`${(game.settings as any).get("core", "uiConfig").colorScheme.applications}`}>
                <RehydratedChatCard blueprint={blueprint} />
            </div>
        )
    }

    if (!game.scenes?.active && ItemsCache.items.size > 0) {
        renderVgLiteChatMessages()
    }
    else if (canvas?.ready && ItemsCache.items.size > 0) {
        renderVgLiteChatMessages()
    }
    else {
        Hooks.once("canvasReady", () => {
            Hooks.once("onItemsCacheInitialized" as any, () => {
                renderVgLiteChatMessages()
            })
        })
    }
})

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