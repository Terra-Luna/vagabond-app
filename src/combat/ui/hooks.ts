import { createContext, useCallback, useContext, useMemo } from "react"

import { CombatGroup } from "../../model/combat/VagabondCombatant"
import { getCanvasToken, getTokenImg } from "../../utils/modelUtil"
import { AdversaryAttack, SavingThrowType } from "../engine/AdversaryAttack"
import { AdversaryComboAttack } from "../engine/AdversaryComboAttack"
import { TargetDisplayItem, useLiveTargetSync } from "../engine/usecase/LiveTargetSyncUseCase"

interface CombatContextProps {
    activeCombatantId?: string | null;
    activeGroup?: CombatGroup | null;
    combatTracker?: CombatTracker
}
export const CombatContext = createContext<CombatContextProps>({ activeCombatantId: null, activeGroup: null, combatTracker: {} as CombatTracker })

export const useIsCurrentCombatant = (combatant) => {
    const { activeCombatantId } = useContext(CombatContext)
    return activeCombatantId === combatant.id || activeCombatantId === combatant._id
}

export const useCombatContext = () => useContext(CombatContext)

export const useAdversaryAttackTargets = (attack: AdversaryAttack | AdversaryComboAttack) => {
    const liveTargetIds = useLiveTargetSync(attack)

    const targets = useMemo<TargetDisplayItem[]>(() => {
        return liveTargetIds
            .map(id => {
                const canvasToken = getCanvasToken(id)
                return {
                    id,
                    src: getTokenImg(canvasToken),
                    token: canvasToken
                }
            })
            .filter(it => it.src != null && it.src.length > 0)
    }, [liveTargetIds])

    const ownedTargets = useMemo(() => {
        return targets.filter(target => game.user?.isActiveGM || target.token?.actor?.isOwner)
    }, [targets])

    return { targets, ownedTargets }
}

export const useAdversaryAttackSaveHandlers = (
    attack: AdversaryAttack | AdversaryComboAttack,
    setRevision: (update: (previous: number) => number) => void,
    subIndex?: number
) => {
    const handleSave = useCallback(async (targetId: string, saveType: SavingThrowType, clickEvent?: React.MouseEvent) => {
        if (attack instanceof AdversaryComboAttack) {
            if (subIndex === undefined) return
            await attack.rollSave(subIndex, targetId, saveType, clickEvent)
        } else {
            await attack.rollSave(targetId, saveType, clickEvent)
        }
        setRevision(previous => previous + 1)
    }, [attack, setRevision, subIndex])

    const handleRerollSave = useCallback(async (targetId: string) => {
        if (attack instanceof AdversaryComboAttack) {
            if (subIndex === undefined) return
            await attack.rerollSave(subIndex, targetId)
        } else {
            await attack.rerollSave(targetId)
        }
        setRevision(previous => previous + 1)
    }, [attack, setRevision, subIndex])

    return { handleSave, handleRerollSave }
}

export const useAdversaryAttack = (
    attack: AdversaryAttack | AdversaryComboAttack,
    setRevision: (update: (previous: number) => number) => void,
    subIndex?: number
) => {
    const targets = useAdversaryAttackTargets(attack)
    const saveHandlers = useAdversaryAttackSaveHandlers(attack, setRevision, subIndex)

    return { ...targets, ...saveHandlers }
}

