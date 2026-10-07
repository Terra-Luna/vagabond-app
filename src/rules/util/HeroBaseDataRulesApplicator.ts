import { sys_id } from "../../utils/foundryUtils"
import { addItems } from "../../utils/heroInventoryUtil"
import { inventoryItemTypes, isPathOfType } from "../../utils/modelUtil"
import { removeWhitespace } from "../../utils/stringUtil"
import { calculateRecurringRuleScale, getRuleSelectionValues, normalizeRuleSelections } from "./item-rules-util"
import { ItemsCache } from "./ItemsCache"
import { getRuleSelectors, normalizeSelector } from "./selector-util"

export class HeroBaseDataRulesApplicator {

    /**
     * Applies active rules from actor items and their referenced Feature Items.
     * @param actor 
     * @returns 
     */
    static apply(actor: Actor & { system: any }) {
        if (!actor || !actor.isOwner) return

        const activeRules = actor.system.getActiveRules()
        const perkGrants = activeRules.filter(r => r.key === "GrantItem" && r.type === "perk")
        const chosenPerkRules = activeRules.filter(r => r.key === "ChoiceSet" && r.pack === "perk")
        const toggleRules = activeRules.filter(r => r.key === "ToggleRule")
        const flatModifiers = activeRules.filter(r => r.key === "FlatModifier")
        const choiceRules = activeRules.filter(r => r.key === "ChoiceSet" && r.channel === "path" && r.sourceMode === "static")
        const itemGrantRules = activeRules.filter(r => r.key === "GrantItem" && inventoryItemTypes().includes(r.type))
        const activeEffectGrantRules = activeRules.filter(r => r.key === "GrantItem" && r.type === "ActiveEffect")

        const perks = ItemsCache.perks()

        const injectGrantedPerkRules = (perkGrants) => {
            perkGrants?.forEach(grant => {
                const perk = perks.find(it => it.uuid === grant.uuid)
                const perkRules = perk?.system.rules
                if (perkRules && perkRules.length > 0) {
                    perkRules.forEach(rule => {
                        if (rule.key === "ToggleRule") toggleRules.push({ ...rule, parentId: perk?.id })
                        if (rule.key === "FlatModifier") flatModifiers.push({ ...rule, parentId: perk?.id })
                    })
                }
            })
        }

        const injectChosenPerkRules = (chosenPerkRules) => {
            chosenPerkRules?.forEach(rule => {
                const ruleSelections = normalizeRuleSelections(rule.selections)
                ruleSelections.forEach(selection => {
                    const perk = perks.find(it => it.uuid === selection.value)
                    const perkRules = perk?.system.rules
                    perkRules?.forEach(rule => {
                        if (rule.key === "ToggleRule") toggleRules.push({ ...rule, parentId: perk?.id })
                        if (rule.key === "FlatModifier") flatModifiers.push({ ...rule, parentId: perk?.id })
                    })
                })

                ruleSelections.forEach(selection => {
                    if (!selection.subselect) return
                    const perk = perks.find(it => it.uuid === selection.value)
                    perk?.system.rules
                        ?.filter(perkRule => perkRule.key === "ChoiceSet" && perkRule.channel === "path")
                        .forEach(perkRule => choiceRules.push({
                            ...perkRule,
                            selections: [{ id: selection.id, value: selection.subselect, subselect: "" }]
                        }))
                })
            })
        }

        const isToggleRuleActive = (rule) =>
            (rule.value === true || rule.value === "true" || rule.value === "enabled") &&
            (!rule.toggleableEffect || actor.system.getRuleToggleState(rule.parentId))
        let activeTogglePaths = new Set<string>()

        const applyToggleRule = async (rule) => {
            const value = isToggleRuleActive(rule)
            const paths = getRuleSelectors(rule).map(it => normalizeSelector(it))

            for (const path of paths) {
                if (path.startsWith("statuses.toggles.")) {
                    const effectName = path?.split(".")?.pop()
                    if (!effectName) continue
                    if (rule.toggleableEffect) continue

                    const actorId = actor.id
                    const lockKey = `${actorId}:${effectName}`

                    if (globalInFlightStatusToggles.has(lockKey)) {
                        continue
                    }
                    else {
                        globalInFlightStatusToggles.add(lockKey)
                    }

                    try {
                        if (value) {
                            if (!actor.statuses.has(effectName)) {
                                const effect = await actor.toggleStatusEffect(effectName, { active: value })
                                if (effect && effect instanceof ActiveEffect) {
                                    effect.setFlag(sys_id, "appliedByRule", rule.id)
                                }
                            }
                        }
                        else {
                            const effect = actor.effects.contents.find(it => it.getFlag(sys_id, "appliedByRule") === rule.id)
                            if (effect) {
                                await actor.deleteEmbeddedDocuments("ActiveEffect", [effect.id ?? ""])
                            }
                        }
                    }
                    finally {
                        globalInFlightStatusToggles.delete(lockKey)
                    }
                }
                else if (path.startsWith("flags.")) {
                    const state = actor.getFlag(sys_id, path.replace("flags.", ""))
                    if (state === undefined) {
                        actor.setFlag(sys_id, path.replace("flags.", ""), value)
                    }
                }
                else {
                    const currentValue = foundry.utils.getProperty(actor.system, path)
                    foundry.utils.setProperty(
                        actor.system,
                        path,
                        typeof currentValue === "boolean" ? value || activeTogglePaths.has(path) : value
                    )
                }
            }
        }

        const strongestMinMaxModifiers = new Map<string, number>()

        const applyFlatModifier = (rule) => {
            const toggleState = !rule.toggleableEffect || actor.system.getRuleToggleState(rule.parentId)
            if (!toggleState) return

            const paths = getRuleSelectors(rule).map(it => normalizeSelector(it))

            paths.forEach(path => {
                const currentValue = foundry.utils.getProperty(actor.system, path) ?? foundry.utils.getProperty(actor.system, path.split(".").slice(0, -1).join("."))
                const multiplierValue = foundry.utils.getProperty(actor.system, rule.valueMultiplier) as number
                const scale = rule.scale > 0
                    ? calculateRecurringRuleScale(actor.system.level.current ?? 1, rule.level, rule.scale)
                    : 1

                if (typeof currentValue === "number") {
                    let adjValue = Math.ceil(rule.value * (multiplierValue ?? 1)) * scale
                    if (/\.(min|max)$/.test(path)) {
                        const modifierValue = adjValue
                        const strongestValue = strongestMinMaxModifiers.get(path)
                        if (strongestValue !== undefined) {
                            if (modifierValue <= strongestValue) return
                            adjValue = modifierValue - strongestValue
                        }
                        strongestMinMaxModifiers.set(path, modifierValue)
                    }
                    foundry.utils.setProperty(actor.system, path, currentValue + adjValue)
                }
                else if (typeof currentValue === "string") {
                    foundry.utils.setProperty(actor.system, path, String(rule.value))
                }
                else if (Array.isArray(currentValue)) {
                    const updatedArray = [...currentValue]

                    if (rule.value?.includes?.(",") || !Number(rule.value)) {
                        removeWhitespace(rule.value).split(",").forEach((val: any) => {
                            if (Number(val)) {
                                updatedArray.push(Number(val))
                            }
                            else {
                                updatedArray.push(String(val))
                            }
                        })
                    }
                    else {
                        updatedArray.push(Number(rule.value))
                    }

                    foundry.utils.setProperty(actor.system, path, updatedArray)
                }
            })
        }

        const applyChoiceRule = (rule) => {
            getRuleSelectionValues(rule.selections).map(s => s.replace("system.", "")).forEach(path => {
                if (isPathOfType(actor.system, path, "boolean")) {
                    foundry.utils.setProperty(actor.system, path, true)
                }
                else if (isPathOfType(actor.system, path, "number")) {
                    const currentValue = foundry.utils.getProperty(actor.system, path)
                    foundry.utils.setProperty(actor.system, path, currentValue + rule.value)
                }
                else if (isPathOfType(actor.system, path, "array")) {
                    const segments = path.split(".")
                    const value = segments.pop()
                    const arrayPath = segments.join(".")
                    const values = foundry.utils.getProperty(actor.system, arrayPath) as any[]
                    if (value && !values.includes(value)) {
                        foundry.utils.setProperty(actor.system, arrayPath, [...values, value])
                    }
                }
                else {
                    foundry.utils.setProperty(actor.system, path, rule.value)
                }
            })
        }

        const applyInventoryItems = async (rule) => {
            const actorId = actor.id
            if (!actorId) return

            const actorItemUuids = actor.items.map(it => it.getFlag("core", "sourceId" as any))
            if (actorItemUuids.includes(rule.uuid)) return

            /**
             * Guards against adding the same granted item twice.
             */
            if (!globalInFlightItemGrants.has(actorId)) {
                globalInFlightItemGrants.set(actorId, new Set())
            }
            const queue = globalInFlightItemGrants.get(actorId)!
            if (queue.has(rule.uuid)) return

            queue.add(rule.uuid)

            try {
                await addItems(actor, [rule.uuid])
            }
            finally {
                setTimeout(() => {
                    queue.delete(rule.uuid)
                }, 500)
            }
        }

        const applyActiveEffectGrants = async (rule: any) => {
            const actorId = actor.id
            if (!actorId) return

            const currentOrigins = actor.effects.map(fx => fx.origin)
            if (currentOrigins.includes(rule.uuid)) return

            if (!globalInFlightGrants.has(actorId)) {
                globalInFlightGrants.set(actorId, new Set())
            }
            const actorLockSet = globalInFlightGrants.get(actorId)!
            if (actorLockSet.has(rule.uuid)) return

            actorLockSet.add(rule.uuid)

            try {
                const sourceEffect = await fromUuid(rule.uuid)
                if (!sourceEffect) {
                    actorLockSet.delete(rule.uuid)
                    return
                }

                if (actor.effects.some(fx => fx.origin === rule.uuid)) {
                    actorLockSet.delete(rule.uuid)
                    return
                }

                const effectData = sourceEffect.toObject() as unknown as { name: string;[key: string]: any }
                effectData.origin = rule.uuid

                await actor.createEmbeddedDocuments("ActiveEffect", [effectData])
            }
            catch (err) {
                console.error("Vagabond | Error applying rule grant:", err)
            }
            finally {
                setTimeout(() => {
                    actorLockSet.delete(rule.uuid)
                }, 500)
            }
        }

        injectGrantedPerkRules(perkGrants)
        injectChosenPerkRules(chosenPerkRules)
        activeTogglePaths = new Set(
            toggleRules
                .filter(isToggleRuleActive)
                .flatMap(rule => getRuleSelectors(rule).map(path => normalizeSelector(path)))
        )
        for (const rule of toggleRules) { applyToggleRule(rule) }
        for (const rule of flatModifiers) { applyFlatModifier(rule) }
        for (const rule of choiceRules) { applyChoiceRule(rule) }
        for (const rule of itemGrantRules) { applyInventoryItems(rule) }
        for (const rule of activeEffectGrantRules) { applyActiveEffectGrants(rule) }
    }

}

/**
 * Added these to monitor what's in the process of being granted since they're
 * happening async behind the scenes. They're referenced in the functions above
 * to prevent adding duplicate items/active effects...
 */
const globalInFlightGrants = new Map<string, Set<string>>()
const globalInFlightItemGrants = new Map<string, Set<string>>()
const globalInFlightStatusToggles = new Set<string>()