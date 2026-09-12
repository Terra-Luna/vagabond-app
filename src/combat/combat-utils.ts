import { VagabondCombatant } from "./documents/VagabondCombat"

export const getControlledTokens = () => game.canvas?.tokens?.controlled?.filter(t => t.combatant) ?? [] as unknown as Token[]
export const getControlledCombatants = () => (getControlledTokens().map(t => t.combatant!) ?? []) as unknown as VagabondCombatant[]

export const combineCombatantWithControlledCombatants = (...additionalCombatants: VagabondCombatant[]) => {
    const allCombatants = new Set(getControlledCombatants())
    if (additionalCombatants?.length) {
        additionalCombatants.forEach(comb => allCombatants.add(comb))
    }

    return [...allCombatants]
}

export const performAsyncActionOnControlledCombatants = async (action: (combatant: VagabondCombatant) => Promise<any> | null | undefined, ...additionalCombatants: VagabondCombatant[]) => {
    return await performAsyncActionOnCombatants([...combineCombatantWithControlledCombatants(...additionalCombatants)], action)
}

export const performAsyncActionOnCombatants = async (combatants: VagabondCombatant[], action: (combatant: VagabondCombatant) => Promise<any> | null | undefined) => {
    for (const combatant of combatants) {
        await action(combatant)
    }
}