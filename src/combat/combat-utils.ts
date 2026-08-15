import { VagabondCombatant } from "./documents/VagabondCombat"

export const getControlledTokens = () => game.canvas?.tokens?.controlled?.filter(t => t.combatant) ?? [] as unknown as Token[]
export const getControlledCombatants = () => (getControlledTokens().map(t => t.combatant!) ?? []) as unknown as VagabondCombatant[]