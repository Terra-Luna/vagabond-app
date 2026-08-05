import { HeroDataModel } from "../../model/actor/HeroDataModel";
import { inventoryItemTypes } from "../../model/actor/type/Inventory";
import { addItems } from "../../utils/heroInventoryUtil";
import { isPathOfType } from "../../utils/modelUtil";
import { ItemsCache } from "./ItemsCache";

export class HeroBaseDataRulesApplicator {

    static apply(actor: Actor & { system: HeroDataModel }) {
        if (!actor) return
        // Get rules from Ancestry, Class, and granted Perks and process them.
        const perkSelections = actor.getFlag("vagabond-lite" as any, "perkSelections") ?? []
        const activeRules = actor.system.getActiveRules()
        const perkGrants = activeRules.filter(r => r.key === "GrantItem" && r.type === "perk")
        const toggleRules = activeRules.filter(r => r.key === "ToggleRule")
        const flatModifiers = activeRules.filter(r => r.key === "FlatModifier")
        const choiceRules = activeRules.filter(r => r.key === "ChoiceSet" && r.channel === "path" && r.sourceMode === "static")
        const itemGrantRules = activeRules.filter(r => r.key === "GrantItem" && inventoryItemTypes().includes(r.type))

        const applyPerkSelections = (perkSelections) => {
            Object.keys(perkSelections ?? {})?.forEach(key => {
                const path = perkSelections[key][0]
                const currentValue = foundry.utils.getProperty(actor.system, path)
                foundry.utils.setProperty(actor.system, path, (typeof currentValue === "number") ? currentValue + 1 : true)
            })
        }

        const injectGrantedPerkRules = (perkGrants) => {
            if (perkGrants && perkGrants.length > 0) {
                const items = ItemsCache.perks()
                for (const grant of perkGrants) {
                    const perk = items.find(it => it.uuid === grant.uuid)
                    const perkRules = perk?.system.rules
                    if (perkRules && perkRules.length > 0) {
                        perkRules.forEach(rule => {
                            if (rule.key === "ToggleRule") toggleRules.push(rule)
                            if (rule.key === "FlatModifier") flatModifiers.push(rule)
                        })
                    }
                }
            }
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
            if (typeof currentValue === "number") {
                foundry.utils.setProperty(actor.system, path, currentValue + rule.value * (multiplierValue ?? 1))
            }
            else if (Array.isArray(currentValue)) {
                const updatedArray = [...currentValue, rule.value]
                foundry.utils.setProperty(actor.system, path, updatedArray)
            }
        }

        const applyChoiceRule = (rule) => {
            rule.selections.map(s => s.replace("system.", "")).forEach(path => {
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

        applyPerkSelections(perkSelections)
        injectGrantedPerkRules(perkGrants)
        for (const rule of toggleRules) { applyToggleRule(rule) }
        for (const rule of flatModifiers) { applyFlatModifier(rule) }
        for (const rule of choiceRules) { applyChoiceRule(rule) }
        for (const rule of itemGrantRules) { applyInventoryItems(rule) }
    }
    
}