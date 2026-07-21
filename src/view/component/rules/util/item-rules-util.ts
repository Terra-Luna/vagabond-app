import { PerkDataModel } from "../../../../model/item/character/PerkDataModel"
import { SpellDataModel } from "../../../../model/item/character/SpellDataModel"
import { vgLiteLang } from "../../../../utils/lang"
import { CombinedItems } from "../../../../utils/modelUtil"

export interface ItemRule {
    id: string,
    label: string,
    level: number,
    maxChoices: number,
    value: number,
    pack: string,
    choices: { value: string, label: string }[],
    selections: string[]
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
export async function getSpellChoices(): Promise<{ value: string, label: string }[]> {
    const unifiedItems = await CombinedItems('spell')
    return unifiedItems
        .filter(item => item.system && isSpell(item.system))
        .map(item => ({ value: item.uuid, label: item.name ?? "" }))
}

function isSpell(system: any): system is SpellDataModel {
    return system && (system.type === "spell" in system)
}

/**
 * Filters the combined world/compendium array specifically for Perks
 */
export async function getPerkChoices(): Promise<{ value: string, label: string }[]> {
    const unifiedItems = await CombinedItems('perk')
    return unifiedItems
        .filter(item => item.system && isPerk(item.system))
        .map(item => ({ value: item.uuid, label: item.name ?? "" }))
}

function isPerk(system: any): system is PerkDataModel {
    return system && (system.type === "perk" in system)
}

export async function getItemChoiceRules(rulesData: any[]): Promise<ItemRule[]> {
    if (!Array.isArray(rulesData)) return []

    const choiceSetRules = rulesData.filter(rule => rule.key === "ChoiceSet" && rule.channel === "item")

    const parsedRulesPromises = choiceSetRules.map(async (rule) => {
        let finalizedChoices = Array.isArray(rule.choices) ? [...rule.choices] : []

        // If static choices are empty, fetch from the whole system (World + Packs)
        if (finalizedChoices.length === 0) {
            if (rule.pack === "spell") {
                finalizedChoices = await getSpellChoices()
            }
            else if (rule.pack === "perk") {
                finalizedChoices = await getPerkChoices()
            }
        }

        return {
            id: rule.id,
            label: rule.label ?? "",
            level: Number(rule.level ?? 0),
            maxChoices: Number(rule.maxChoices ?? 1),
            value: Number(rule.value ?? 1),
            pack: rule.pack,
            choices: finalizedChoices,
            selections: rule.selections
        }
    })

    return Promise.all(parsedRulesPromises)
}

export const getTotalMaxChoices = (rules): number => {
    return rules.reduce((sum, r) => { return sum + r.maxChoices }, 0)
}