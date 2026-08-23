import { vgLiteLang } from "../../utils/lang"
import { CombinedItems } from "../../utils/modelUtil"
import { ItemsCache } from "./ItemsCache"

export interface ItemRule {
    id: string,
    key: string,
    label: string,
    level: number,
    scale: number,
    maxChoices: number,
    value: number,
    pack: string,
    choices: { value: string, label: string }[],
    selections: RuleSelection[]
}

export interface RuleSelection {
    id: string
    value: string
    subselect: string
}

export const randomId = () => foundry.utils.randomID()

export const normalizeRuleSelections = (selections: unknown): RuleSelection[] => {
    if (!Array.isArray(selections)) return []

    return selections.flatMap(selection => {
        if (typeof selection === "string") {
            return selection ? [{ id: randomId(), value: selection, subselect: "" }] : []
        }

        if (!selection || typeof selection !== "object" || typeof (selection as any).value !== "string") return []
        return [{
            id: typeof (selection as any).id === "string" ? (selection as any).id : randomId(),
            value: (selection as any).value,
            subselect: typeof (selection as any).subselect === "string" ? (selection as any).subselect : ""
        }]
    })
}

export const getRuleSelectionValues = (selections: unknown, ruleId?: string): string[] =>
    normalizeRuleSelections(selections)
        .filter(selection => ruleId == null || selection.value === ruleId)
        .map(selection => selection.value)

export async function savePerkSelections(actor: Actor & { system: any }, slots: { ruleId: string, value: string, selectionId?: string }[]) {
    const sourceItems = actor.items.filter(item => ["class", "ancestry"].includes(item.type as string)) as any[]
    const rulesByItem = sourceItems.map(item => ({
        item,
        rules: foundry.utils.deepClone((item.system as any).rules ?? []) as any[]
    }))
    const virtualPerkRules = actor.system.perks.flatMap(perk => (perk.rules ?? []).map(rule => ({
        ruleId: rule.id,
        sourceId: perk._sourceId
    })))

    for (const slot of slots.filter(slot => slot.value)) {
        const directRule = rulesByItem.flatMap(source => source.rules).find(rule => rule.id === slot.ruleId)
        if (directRule) {
            const selections = normalizeRuleSelections(directRule.selections)
            const existing = selections.find(selection => slot.selectionId
                ? selection.id === slot.selectionId
                : selection.value === slot.value)
            if (existing) existing.value = slot.value
            else selections.push({ id: slot.selectionId ?? randomId(), value: slot.value, subselect: "" })
            directRule.selections = selections
            continue
        }

        const virtualRule = virtualPerkRules.find(rule => rule.ruleId === slot.ruleId)
        const parentSelection = virtualRule && rulesByItem
            .flatMap(source => source.rules)
            .find(rule => normalizeRuleSelections(rule.selections).some(selection =>
                slot.selectionId
                    ? selection.id === slot.selectionId
                    : selection.value === virtualRule.sourceId))
        if (!parentSelection) continue

        const selections = normalizeRuleSelections(parentSelection.selections)
        const existing = selections.find(selection =>
            slot.selectionId
                ? selection.id === slot.selectionId
                : selection.value === virtualRule.sourceId)
        if (existing) existing.subselect = slot.value
        parentSelection.selections = selections
    }

    await Promise.all(rulesByItem.map(({ item, rules }) => item.update({ "system.rules": rules } as Record<string, any>)))
    await actor.system?.forceUpdate?.()
}

export function getFlatStatBonuses(items: (Item & { system: { rules: any } } | undefined)[]): { name: string, stat: string, bonus: number }[] {
    const rules: any[] = []

    const getFlatStatBonusRules = (item) => {
        if (!item?.system?.rules) return
        rules.push(
            ...item.system.rules.filter(r => r.key === 'FlatModifier' && r.value && r.selector.includes('stats.'))
        )
    }

    items.forEach(item => {
        getFlatStatBonusRules(item)
    })

    // Return a list of flat bonuses by stat name and value...
    return rules.map(rule => (
        { name: rule.label, stat: rule.selector.split('.').reverse()[0], bonus: rule.value }
    ))
}

export function getStatChoiceRules(items: (Item & { system: { rules: any } } | undefined)[]) {
    const gatheredRules: any[] = []

    const extractStatChoiceRules = (item: any) => {
        if (!item?.system?.rules) return
        const rules: any[] = item.system.rules

        const statChoices = rules.filter(r => {
            // Ignore any rules without choices - they're probably Item Grants.
            if (r.key !== "ChoiceSet") return

            const choicesArray = Array.isArray(r.choices) ? r.choices : []
            if (choicesArray.length === 0) return

            const firstChoiceObj = choicesArray[0]
            const firstChoiceVal: string = typeof firstChoiceObj === "string"
                ? firstChoiceObj
                : (firstChoiceObj?.value || "")

            // If choices contains a stat wildcard token string ("stats.*")
            if (firstChoiceVal.toLowerCase().includes("stats.*") || firstChoiceVal.toLowerCase() === "stats.*") {
                return true
            }

            // Manually curated list of options...
            return choicesArray.some((c: any) => {
                const val = (c?.value || "").toLowerCase()
                return val.startsWith("stats.") || val.startsWith("system.stats.")
            })
        })

        gatheredRules.push(...statChoices)
    }

    items.forEach(item => {
        extractStatChoiceRules(item)
    })

    // Expand stat wildcard array tokens into fully populated selection arrays
    return gatheredRules.map(rule => {
        const choicesArray = Array.isArray(rule.choices) ? rule.choices : []
        if (choicesArray.length === 0) return rule

        const firstChoiceObj = choicesArray[0]
        const firstChoiceVal: string = typeof firstChoiceObj === "string"
            ? firstChoiceObj
            : (firstChoiceObj?.value || "")

        // If it's not a wildcard array template, move on...
        if (!firstChoiceVal.toLowerCase().includes("stats.*") && firstChoiceVal.toLowerCase() !== "stats.*") {
            return rule
        }

        return {
            ...rule,
            choices: Object.keys(vgLiteLang.Stat || {}).map(statKey => ({
                value: firstChoiceVal.toLowerCase().includes("system.") ? `system.stats.${statKey}` : `stats.${statKey}`,
                label: vgLiteLang.Stat[statKey]?.name || statKey
            }))
        }
    })
}

export function getRequiredSkillTrainingRules(items: (Item & { system: { rules: any } } | undefined)[]): { source: Item, skill: string }[] {
    const itemRules: any[] = []

    const getRequiredTrainings = (item) => {
        if (!item?.system?.rules) return
        const requiredSkillRules = item.system.rules
            .filter(r => r.key === 'ToggleRule' && r.value && r.selector.includes('skills.'))

        if (!requiredSkillRules || requiredSkillRules.length === 0) return

        itemRules.push({ item: item, rules: requiredSkillRules })
    }

    items.forEach(item => {
        getRequiredTrainings(item)
    })

    const res: { source: Item, skill: string }[] = []
    itemRules.forEach(itemRule => {
        itemRule.rules.forEach(rule => {
            res.push({ source: itemRule.item, skill: getSkillNameFromPath(rule.selector) })
        })
    })

    return res.sort((a, b) => { return a.skill.localeCompare(b.skill) })
}

export function getSkillTrainingChoiceRules(items: (Item & { system: { rules: any } } | undefined)[]): ItemRule[] {
    const gatheredRules: any[] = []

    const extractSkillRules = (item: Item & { system: { rules: any } } | undefined) => {
        if (!item?.system?.rules) return
        const rules: any[] = item.system.rules

        const skillChoices = rules.filter(r => {
            // Ignore direct Item Grant choice sets...
            if (r.key !== "ChoiceSet") return false

            const choicesArray = Array.isArray(r.choices) ? r.choices : []
            if (choicesArray.length === 0) return false

            const firstChoiceObj = choicesArray[0]
            const firstChoiceVal: string = typeof firstChoiceObj === "string"
                ? firstChoiceObj
                : (firstChoiceObj?.value || "")

            // Check if it's a wildcard skills rule OR a manual list targeting skills paths
            const isSkillRule = firstChoiceVal.toLowerCase().includes("skills.*") ||
                choicesArray.some((c: any) => (c?.value || "").toLowerCase().includes("skills."))

            return isSkillRule
        })

        gatheredRules.push(...skillChoices)
    }

    items.forEach(item => {
        extractSkillRules(item)
    })

    // Expand wildcard array tokens into fully option arrays
    return gatheredRules.map(rule => {
        const choicesArray = Array.isArray(rule.choices) ? rule.choices : []
        if (choicesArray.length === 0) return rule

        const firstChoiceObj = choicesArray[0]
        const firstChoiceVal: string = typeof firstChoiceObj === "string"
            ? firstChoiceObj
            : (firstChoiceObj?.value || "")

        // Handle the Wildcard string blueprint pattern: "skills.*.isTrained"
        if (firstChoiceVal.toLowerCase().includes("skills.*")) {
            return {
                ...rule,
                choices: Object.keys(vgLiteLang.Skills || {}).map(skillKey => ({
                    // Replaces the wildcard character slot with the individual key
                    value: firstChoiceVal.replace("*", skillKey),
                    label: vgLiteLang.Skills[skillKey]?.name || skillKey
                }))
            }
        }

        return {
            ...rule,
            choices: choicesArray.map((c: any) => ({
                value: c.value,
                label: c.label || getSkillNameFromPath(c.value)
            })).sort((a, b) => { return a.label.localeCompare(b.label) })
        }
    })
}

export function getSkillNameFromPath(path: string): string {
    return path.split('.').reverse()[1]
}

/**
 * The type arg should correspond to the item's type value in the datamodel.
 *      E.g.: 'spell', 'perk', 'weapon', etc...
 * @param type 
 * @param items 
 * @returns 
 */
export async function getItemGrants(type: string, items: (Item & { system: { rules: any } } | undefined)[]): Promise<(ItemRule & { item: string, uuid: string, source: string })[]> {
    const itemsOfType = await CombinedItems(type)
    const itemsById = itemsOfType.map(it => ({ uuid: it.uuid, name: it.name }))
    const itemIds = new Set(itemsById.map(it => it.uuid))

    const grantsPromises = items.map(async (item) => {
        if (!item?.system?.rules) return []

        const grants = item.system.rules.filter(r => r.key === "GrantItem" && itemIds.has(r.uuid))

        return grants.map(grant => ({
            ...grant,
            item: itemsById.find(it => it.uuid === grant.uuid)?.name ?? '',
            uuid: grant.uuid,
            source: item.name ?? ''
        }))
    })

    const allGrantsNested = await Promise.all(grantsPromises)
    return allGrantsNested.flat()
}

/**
 * Filters the combined world/compendium array specifically for Spells
 */
export function getSpellChoices(): { value: string, label: string }[] {
    return ItemsCache.spells().map(item => ({ value: item.uuid, label: item.name ?? "" }))
}

/**
 * Filters the combined world/compendium array specifically for Perks
 */
export function getPerkChoices(): { value: string, label: string }[] {
    return ItemsCache.perks().map(item => ({ value: item.uuid, label: item.name ?? "" }))
}

export function getItemChoiceRules(level: number, rulesData: any[]): ItemRule[] {
    if (!Array.isArray(rulesData)) return []

    const choiceSetRules = rulesData.filter(rule => rule.level <= level && rule.key === "ChoiceSet" && rule.channel === "item")

    const parsedRules = choiceSetRules.map((rule) => {
        let finalizedChoices = Array.isArray(rule.choices) ? [...rule.choices] : []

        // If static choices are empty, fetch from the whole system (World + Packs)
        if (finalizedChoices.length === 0) {
            if (rule.pack === "spell") {
                finalizedChoices = getSpellChoices()
            }
            else if (rule.pack === "perk") {
                finalizedChoices = getPerkChoices()
                /**
                 * Apply Perk filter rules...
                 */
                if (rule.filters && rule.filters.length > 0) {
                    const trainingFilters = rule.filters.filter(it => it.type === 'training').map(it => it.value) as string[]
                    finalizedChoices = finalizedChoices.filter(choice => {
                        const perk = ItemsCache.perks().find(it => it.uuid === choice.value)
                        const perkTrainingPrereqs = perk?.system.prerequisites
                            .filter(it => it.type === 'trained')
                            .flatMap(it => it.skills)
                            .flatMap(it => it.skillNames)
                        return perkTrainingPrereqs?.some(it => trainingFilters.includes(it))
                    })
                }
            }
        }

        const scale = Number(rule.scale ?? "0")
        const maxChoices = scale < 1
            ? Number(rule.maxChoices ?? 1)
            : calculateRecurringChoices(level, Number(rule.level), Number(rule.maxChoices), Number(rule.scale))

        return {
            id: rule.id,
            key: rule.key,
            sourceKey: rule.sourceKey,
            label: rule.label ?? "",
            level: Number(rule.level ?? 0),
            scale: rule.scale,
            maxChoices: maxChoices,
            value: Number(rule.value ?? 1),
            pack: rule.pack,
            choices: finalizedChoices,
            selections: rule.selections
        }
    })

    return parsedRules.sort((a, b) => a.level - b.level)
}

export const calculateRecurringChoices = (level: number, ruleLevel: number, maxChoices: number, scale: number): number => {
    if (scale < 1) {
        return maxChoices
    }
    else {
        return maxChoices * Math.floor((level - ruleLevel) / scale + 1)
    }
}

export const calculateRecurringRuleEligibility = (level: number, ruleLevel: number, scale: number): boolean => {
    return (level - ruleLevel) % (scale ?? 0) === 0
}

export const calculateRecurringRuleScale = (level: number, ruleLevel: number, scale: number): number => {
    return Math.floor((level - ruleLevel) / scale + 1)
}