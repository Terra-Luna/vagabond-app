export const getCombatantStatuses = (combatant) => {
    const allStatuses = Object.keys(combatant.actor.system.statuses.toggles)
    return allStatuses.reduce((acc, statusKey) => {
        if (combatant.actor.system.statuses.toggles[statusKey]) {
            return [...acc, statusKey]
        }
        return acc
    }, [] as string[])
}

export const combatantHasStatus = (combatant, status) => {
    return getCombatantStatuses(combatant).includes(status)
}

export const allCombatantsHaveStatus = (combatants: any[], status) => {
    return combatants.every(combatant => combatantHasStatus(combatant, status))
}