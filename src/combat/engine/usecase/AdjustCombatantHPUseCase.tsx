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
        const actorUpdates: Record<string, any>[] = []
        const tokenUpdates: Record<string, any>[] = []
        const sheetsToRefresh: any[] = []

        const hpChange = hpAdjustment * (mode === 'add' ? 1 : -1)

        for (const c of combatants) {
            const tokenDoc = c.token
            const actor = tokenDoc?.actor
            if (!tokenDoc || !actor) continue

            const currentHp = (actor.system as ActorDataModel<BaseActorSchema>).health.current ?? 0
            const targetHp = currentHp + hpChange

            if (actor.sheet?.rendered) {
                sheetsToRefresh.push(actor.sheet)
            }

            if (tokenDoc.actorLink) {
                actorUpdates.push({ _id: actor.id, 'system.health.current': targetHp })
            }
            else {
                tokenUpdates.push({ _id: tokenDoc.id, 'delta.system.health.current': targetHp })
            }
        }

        await Promise.all([
            actorUpdates.length > 0 ? Actor.updateDocuments(actorUpdates) : null,
            tokenUpdates.length > 0 ? canvas?.scene?.updateEmbeddedDocuments('Token', tokenUpdates) : null
        ])

        for (const sheet of sheetsToRefresh) {
            sheet.render(false)
        }

    }, [combatants, mode, hpAdjustment])
    
    return { mode, setMode, hpAdjustment, setHpAdjustment, updateHP }
}