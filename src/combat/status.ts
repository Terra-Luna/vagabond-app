const getAllStatuses = (combatant) => Object.keys(combatant.actor.system.statuses.statuses)

export const getCombatantStatuses = (combatant) => {
    const allStatuses = getAllStatuses(combatant)
    return allStatuses.reduce((acc, statusKey) => {
        if (combatant.actor.system.statuses[statusKey]) {
            return [...acc, statusKey]
        }
        return acc
    }, [] as string[])
}