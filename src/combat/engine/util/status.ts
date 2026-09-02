import { combineCombatantWithControlledCombatants } from "../../combat-utils"
import { VagabondCombatant } from "../../documents/VagabondCombat"

export const getCombatantStatuses = (combatant) => {
    const statuses = combatant?.actor?.system?.statuses ?? {}
    const toggles = statuses.toggles ?? statuses.statuses ?? {}

    return Object.entries(toggles)
        .filter(([, isActive]) => Boolean(isActive))
        .map(([statusKey]) => statusKey)
}

export const combatantHasStatus = (combatant, status) => {
    return getCombatantStatuses(combatant).includes(status)
}

export const controlledCombatantsHaveStatus = (status, ...additionalCombatants: VagabondCombatant[]) => allCombatantsHaveStatus(combineCombatantWithControlledCombatants(...additionalCombatants), status)

export const allCombatantsHaveStatus = (combatants: any[], status) => {
    return combatants.every(combatant => combatantHasStatus(combatant, status))
}