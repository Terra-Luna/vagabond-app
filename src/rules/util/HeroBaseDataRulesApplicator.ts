import { addItems } from "../../utils/heroInventoryUtil"
import { inventoryItemTypes, isPathOfType } from "../../utils/modelUtil"
import { calculateRecurringRuleScale, getRuleSelectionValues, normalizeRuleSelections } from "./item-rules-util"
import { ItemsCache } from "./ItemsCache"

export class HeroBaseDataRulesApplicator {

    static apply(actor: Actor & { system: any }) {
        if (!actor || !actor.isOwner) return

        const activeRules = actor.system.getActiveRules()
        const perkGrants = activeRules.filter(r => r.key === "GrantItem" && r.type === "perk")
        const chosenPerkRules = activeRules.filter(r => r.key === "ChoiceSet" && r.pack === "perk")
        const toggleRules = activeRules.filter(r => r.key === "ToggleRule")
        const flatModifiers = activeRules.filter(r => r.key === "FlatModifier")
        const choiceRules = activeRules.filter(r => r.key === "ChoiceSet" && r.channel === "path" && r.sourceMode === "static")
        const itemGrantRules = activeRules.filter(r => r.key === "GrantItem" && inventoryItemTypes().includes(r.type))

        const perks = ItemsCache.perks()

        const injectGrantedPerkRules = (perkGrants) => {
            perkGrants?.forEach(grant => {
                const perk = perks.find(it => it.uuid === grant.uuid)
                const perkRules = perk?.system.rules
                if (perkRules && perkRules.length > 0) {
                    perkRules.forEach(rule => {
                        if (rule.key === "ToggleRule") toggleRules.push(rule)
                        if (rule.key === "FlatModifier") flatModifiers.push(rule)
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
                        if (rule.key === "ToggleRule") toggleRules.push(rule)
                        if (rule.key === "FlatModifier") flatModifiers.push(rule)
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

        const applyToggleRule = (rule) => {
            const path = rule.selector.replace("system.", "")
            const booleanValue = rule.value === true || rule.value === "true" || rule.value === "enabled"
            foundry.utils.setProperty(actor.system, path, booleanValue)
        }

        const applyFlatModifier = (rule) => {
            const path = rule.selector.replace("system.", "")
            const currentValue = foundry.utils.getProperty(actor.system, path)
            const multiplierValue = foundry.utils.getProperty(actor.system, rule.valueMultiplier) as number
            const scale = rule.scale > 0
                ? calculateRecurringRuleScale(actor.system.level.current ?? 1, rule.level, rule.scale)
                : 1

            if (typeof currentValue === "number") {
                foundry.utils.setProperty(actor.system, path, currentValue + Math.ceil(rule.value * (multiplierValue ?? 1)) * scale)
            }
            else if (Array.isArray(currentValue)) {
                const updatedArray = [...currentValue, rule.value]
                foundry.utils.setProperty(actor.system, path, updatedArray)
            }
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
                else {
                    foundry.utils.setProperty(actor.system, path, rule.value)
                }
            })
        }

        const applyInventoryItems = async (rule) => {
            const actorItemUuids = actor.items.map(it => it.getFlag("core", "sourceId" as any))
            if (actorItemUuids.includes(rule.uuid)) return
            await addItems(actor, [rule.uuid])
        }

        injectGrantedPerkRules(perkGrants)
        injectChosenPerkRules(chosenPerkRules)
        for (const rule of toggleRules) { applyToggleRule(rule) }
        for (const rule of flatModifiers) { applyFlatModifier(rule) }
        for (const rule of choiceRules) { applyChoiceRule(rule) }
        for (const rule of itemGrantRules) { applyInventoryItems(rule) }
    }
    
}