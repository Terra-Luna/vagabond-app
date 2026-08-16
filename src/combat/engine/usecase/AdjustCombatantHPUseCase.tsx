import { useState, useCallback } from "react"
import { ActorDataModel, BaseActorSchema } from "../../../model/actor/ActorDataModel"
import { VagabondCombatant } from "../../documents/VagabondCombat"

export const useAdjustCombatantHP = (combatants: VagabondCombatant[]) => {
    const [hpAdjustment, setHpAdjustment] = useState(1)
    const [mode, setMode] = useState<'subtr' | 'add'>('subtr')

    /**
     * This loops through all the selected tokens and splits them into two
     * groups: Linked & Un-linked - then prforms a batch update for each
     * group's members' HP values.
     */
    const updateHP = useCallback(async () => {
        await Promise.all(combatants
            .filter(c => c.token?.actor)
            .map(c => {
                const currentHp = (c.token?.actor?.system as ActorDataModel<BaseActorSchema>).health.current ?? 0
                return c.token?.actor?.update({ system: { health: { current: currentHp + (hpAdjustment * (mode === 'add' ? 1 : -1)) } } })
            }))
    }, [combatants, mode, hpAdjustment])
    
    return { mode, setMode, hpAdjustment, setHpAdjustment, updateHP }
}