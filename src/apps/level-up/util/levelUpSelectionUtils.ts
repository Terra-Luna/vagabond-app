export interface LevelUpSelectionCompletionArgs {
    isStatLevel: boolean
    isStatSelected: boolean
    showBonusSelections: boolean
    selectedPerks: any[]
    advancements?: { ruleId: string, selectionId?: string, value: string }[]
    perkTrainings?: { ruleId: string, selectionId?: string, value: string }[]
    reasonTrainings?: { ruleId: string, selectionId?: string, value: string }[]
    spells?: { ruleId: string, selectionId?: string, value: string }[]
}

export const areLevelUpSelectionsComplete = ({
    isStatLevel,
    isStatSelected,
    showBonusSelections,
    selectedPerks,
    advancements = [],
    perkTrainings = [],
    reasonTrainings = [],
    spells = []
}: LevelUpSelectionCompletionArgs) => {
    const requiredBonusSelections = selectedPerks.reduce((count, perk) => {
        if (!perk?.system?.rules) return count
        return count + perk.system.rules.filter(rule => rule.key === "ChoiceSet").length
    }, 0)

    const selectedBonusSelections = advancements.length + perkTrainings.length + reasonTrainings.length + spells.length
    const hasRequiredBonusSelections = !showBonusSelections || selectedBonusSelections >= requiredBonusSelections
    return isStatSelected && hasRequiredBonusSelections && (selectedPerks.length > 0 || isStatLevel)
}