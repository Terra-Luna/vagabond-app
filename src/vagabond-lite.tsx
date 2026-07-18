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
import { AdversarySheet } from "./view/sheets/actor/adversary/AdversarySheet"
import { createRoot } from "react-dom/client"
import { EquipmentSheet } from './view/sheets/item/equip/EquipmentSheet'
import { PerkSheet, SpellSheet } from './view/sheets/item/character/SkillSheets'
import { vgLiteStyles } from "./utils/styleUtils"
import { getId } from "./utils/modelUtil"
import { ClassSheet } from "./view/sheets/item/character/class/ClassSheet"
import { stackStackables } from "./utils/heroInventoryUtil"
import { rehydrateElement } from "./view/chat/ChatCardRehydrator"
import { BaseItemSchema, ItemDataModel } from "./model/item/ItemDataModel"
import { RuleElement } from "./view/component/rules/shared/RuleElement"
import { renderCombatTracker } from "./view/combat/vglite-combat-tracker"
import { VgLiteActor } from "./document/VgLiteActor"
import { VGLiteCombatantModel } from "./model/combat/VgLiteCombatant"
import { vgLiteLang } from "./utils/lang"
import { ActiveEffectDataModel } from "./model/effect/ActiveEffectDataModel"

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
        CONFIG.Item.dataModels.starterPack = StarterPackDataModel,
        CONFIG.Item.dataModels.sundry = SundryDataModel,
        CONFIG.Item.dataModels.tool = ToolDataModel,
        CONFIG.Item.dataModels.weapon = WeaponDataModel,
        // Combat
        CONFIG.Combat.documentClass = VgLiteCombat,
        CONFIG.Combatant.documentClass = VgLiteCombatant,
        CONFIG.Combatant.dataModels.base = VGLiteCombatantModel,
        CONFIG.ActiveEffect.documentClass = VgLiteActiveEffect,
        CONFIG.statusEffects = VgLiteActiveEffect.statusEffects as any,
        CONFIG.ActiveEffect.dataModels = { base: ActiveEffectDataModel as any }
    )
    foundry.applications.sidebar.tabs.CombatTracker.PARTS.tracker.template = "systems/vagabond-lite/react-placeholder.hbs"
})

Hooks.on("updateActor", async (actor: Actor, change: any, options: any, userId: string) => {
    if (game.user?.id !== userId) return

    const flagChanges = foundry.utils.getProperty(change, "flags.vagabond-lite")
    const currentLevel = foundry.utils.getProperty(actor, "system.level.current") as unknown as number
    const itemsToCreate: any[] = []

    // Scan all existing items (like the Class/Ancestry/Equipment...) for rules
    for (const item of actor.items) {
        const rules: RuleElement[] = (item.system as any).rules || []

        /**
         * Level-locked Grants...
         */
        const grantRules = rules.filter(r => r.key === "GrantItem")
        for (const rule of grantRules) {
            const requiredLevel = rule.level || 0

            if (currentLevel && currentLevel >= requiredLevel) {
                const alreadyGranted = actor.items.contents.some(i =>
                    foundry.utils.getProperty(i, "flags.vagabond-lite.grantedBy") === item.id &&
                    foundry.utils.getProperty(i, "flags.vagabond-lite.ruleId") === rule.id
                )

                if (!alreadyGranted) {
                    const doc = await fromUuid(rule.uuid)
                    if (doc) {
                        const plainObj = doc.toObject()
                        foundry.utils.setProperty(plainObj, "flags.vagabond-lite.grantedBy", item.id)
                        foundry.utils.setProperty(plainObj, "flags.vagabond-lite.ruleId", rule.id)
                        itemsToCreate.push(plainObj)
                    }
                }
            }
        }

        /**
         * Process player choice sets...
         */
        if (flagChanges) {
            const choiceRules = rules.filter(r => r.key === "ChoiceSet")

            for (const rule of choiceRules) {
                if (flagChanges[rule.flag] !== undefined) {
                    const rawSelections = flagChanges[rule.flag]

                    const currentSelectedUuids: string[] = Array.isArray(rawSelections)
                        ? rawSelections
                        : (rawSelections ? [rawSelections] : [])

                    // Find and delete any old items previously granted by this specific rule choice block
                    const oldGrants = actor.items.contents
                        .filter(i => foundry.utils.getProperty(i, "flags.vagabond-lite.grantedByChoice") === rule.id)
                        .map(i => i.id).filter((id): id is string => id !== null)

                    if (oldGrants.length > 0) {
                        await actor.deleteEmbeddedDocuments("Item", oldGrants)
                    }

                    // Push the newly selected item choices to queue...
                    for (const uuid of currentSelectedUuids) {
                        const originalDoc = await fromUuid(uuid)
                        if (originalDoc) {
                            const plainObject = originalDoc.toObject()

                            // Stamp custom choice metadata tags into the item flags
                            foundry.utils.setProperty(plainObject, "flags.vagabond-lite.grantedByChoice", rule.id)
                            foundry.utils.setProperty(plainObject, "flags.vagabond-lite.grantedByItem", item.id)

                            itemsToCreate.push(plainObject)
                        }
                    }
                }
            }
        }
    }

    // Commit!
    if (itemsToCreate.length > 0) {
        await actor.createEmbeddedDocuments("Item", itemsToCreate)
    }
})

Hooks.on("preCreateItem", (item: any, _options, _userId) => {
    if (!item.parent || item.parent.documentName !== "Actor") return true

    const actor = item.parent

    if (actor && isInventoryItem(item)) {
        if (item.system.bulk.isStackable) {
            const stack = actor.items.find((it: any) => it.name === item.name)
            if (stack != undefined) {
                stack.update({ 'system.bulk.quantity': stack.system.bulk.quantity + 1 })
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

    /**
     * Prevent adding duplicate perks and spells (unless the perk can be taken multiple times).
     */
    if (item.type === 'perk') {
        return item.system.canTakeMultiple || !actor.items.contents.some(i => i.type === 'perk' && i.name === item.name)
    }

    if (item.type === 'spell') {
        return !actor.items.contents.some(i => i.type === 'spell' && i.name === item.name)
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
    }

    if (game.user?.id === _userId && item.parent) {
        const currentLevel = (foundry.utils.getProperty(item.parent, "system.level.current") as number) ?? 0

        // Find all GrantItem rules attached to the newly added item
        const grantRules = (item as Item & { system: ItemDataModel<BaseItemSchema> }).system.rules?.filter((r: any) => r.key === "GrantItem") || []
        if (grantRules.length === 0) return

        const itemsToCreate: any[] = []
        for (const rule of grantRules) {
            const requiredLevel = (rule.level as number) ?? 0
            if (currentLevel < requiredLevel) continue

            const grantedDoc = await fromUuid((rule as unknown as any).uuid)
            if (grantedDoc) {
                const plainObject = grantedDoc.toObject()
                foundry.utils.setProperty(plainObject, "flags.vagabond-lite.grantedBy", item.id)
                itemsToCreate.push(plainObject)
            }
        }

        if (itemsToCreate.length > 0) {
            await item.parent.createEmbeddedDocuments("Item", itemsToCreate)
        }
    }
})

Hooks.on("updateItem", (item, changed, options, userId) => {
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
})

Hooks.on("renderCombatTracker", (_app, html, data) => {
    renderCombatTracker(html, data)
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