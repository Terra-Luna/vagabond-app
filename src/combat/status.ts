export const getCombatantStatuses = (combatant) => {
    const allStatuses = Object.keys(combatant.actor.system.statuses.statuses)
    return allStatuses.reduce((acc, statusKey) => {
        if (combatant.actor.system.statuses.statuses[statusKey]) {
            return [...acc, statusKey]
        }
        return acc
    }, [] as string[])
}