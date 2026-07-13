import { vgLiteLang } from "../../../../utils/lang"

export function getFlatStatBonuses(items: (Item & { system: { rules: any } } | undefined)[]): { name: string, stat: string, value: number }[] {
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
        { name: rule.label, stat: rule.selector.split('.').reverse()[0], value: rule.value }
    ))
}

export function getStatChoiceRules(items: (Item & { system: { rules: any}} | undefined)[]) {
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

export function getSkillTrainingChoiceRules(items: (Item & { system: { rules: any } } | undefined)[]) {
    const gatheredRules: any[] = []
    
    const extractSkillRules = (item: any) => {
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

            const valLower = firstChoiceVal.toLowerCase()

            // Check if it's a wildcard skills rule OR a manual list targeting skills paths
            const isSkillRule = valLower.includes("skills.*") ||
                choicesArray.some((c: any) => (c?.value || "").toLowerCase().includes("skills."))

            return isSkillRule
        })

        gatheredRules.push(...skillChoices)
    }

    items.forEach(item => {
        extractSkillRules(item)
    })

    // Expand wildcard array tokens into fully populated option arrays
    return gatheredRules.map(rule => {
        const choicesArray = Array.isArray(rule.choices) ? rule.choices : []
        if (choicesArray.length === 0) return rule

        const firstChoiceObj = choicesArray[0]
        const firstChoiceVal: string = typeof firstChoiceObj === "string"
            ? firstChoiceObj
            : (firstChoiceObj?.value || "")

        // Handle the Wildcard string blueprint pattern "skills.*.isTrained"
        if (firstChoiceVal.toLowerCase().includes("skills.*")) {
            return {
                ...rule,
                choices: Object.keys(vgLiteLang.Skills || {}).map(skillKey => ({
                    // Dynamically replaces the wildcard character slot with the individual key
                    value: firstChoiceVal.replace("*", skillKey),
                    label: vgLiteLang.Skills[skillKey]?.name || skillKey
                }))
            }
        }

        return {
            ...rule,
            choices: choicesArray.map((c: any) => ({
                value: c.value,
                label: c.label || c.value.split('.').reverse()[1]
            }))
        }
    })
}

export function getRequiredSkillTrainingRules(items: (Item & { system: { rules: any } } | undefined)[]): string[] {
    const rules: any[] = []
    
    const getRequiredTrainings = (item) => {
        if (!item?.system?.rules) return
        rules.push(...item.system.rules.filter(r => r.key === 'ToggleRule' && r.value && r.selector.includes('skills.')))
    }

    items.forEach(item => {
        getRequiredTrainings(item)
    })

    // Return a list of required trainings...
    return rules.map(rule => (
        rule.selector.split('.').reverse()[1]
    ))
}