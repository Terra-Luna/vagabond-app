import { createContext, useContext } from "react"

import { CombatGroup } from "../../model/combat/VagabondCombatant";

interface CombatContextProps {
    activeCombatantId?: string | null;
    activeGroup?: CombatGroup | null;
    combatTracker?: CombatTracker;
}
export const CombatContext = createContext<CombatContextProps>({ activeCombatantId: null, activeGroup: null, combatTracker: {} as CombatTracker })

export const useIsCurrentCombatant = (combatant) => {
    const { activeCombatantId } = useContext(CombatContext)
    return activeCombatantId === combatant.id || activeCombatantId === combatant._id
}

export const useCombatContext = () => useContext(CombatContext)