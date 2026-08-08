import { useState, useEffect } from "react"
import { Attack } from "../Attack"
import { AttackSnapshot, serializeAttack } from "./attack-serializer"
import { getAttackRegistry } from "../../../apps/vagabond-tools/VagabondSettingsRegistry"

export interface TargetDisplayItem { id: string, src: string, token: Token | undefined }

/**
 * This use-case is for providing live updates on the target selections
 * for the user who initiated the attack. The GM and all other users won't
 * affect the attack's target selections but using this allows them to see
 * the live updates rendered in their chat log.
 */
export function useLiveTargetSync(attack: Attack | undefined): string[] {
    
    const [targetIds, setTargetIds] = useState<string[]>(() =>
        attack?.targetIds ? [...attack.targetIds] : []
    )

    useEffect(() => {
        if (!attack || attack.isResolved) return

        setTargetIds(attack.targetIds ? [...attack.targetIds] : [])

        /**
         * This will keep the last attack card's targets list in-sync with
         * that user's updated target selections. The GM and other users will
         * not affect the attack's target array.
         */
        const targetHookId = Hooks.on('targetToken', async (user: User, token: Token, isTargeted: boolean) => {
            if (!attack.actor.id || game.userId !== attack.userId || user.id !== game.userId) return

            const attackRegistry = getAttackRegistry()
            const actorAttacks = attackRegistry[attack.actor.id] || []

            const latestAttack = actorAttacks[actorAttacks.length - 1]
            if (latestAttack && latestAttack.id !== attack.id) return

            const filteredIds = Array.from(user.targets).map(t => t.id).filter((id): id is string => !!id)

            attack.targetIds = [...filteredIds]
            setTargetIds([...filteredIds])

            await attack.save(serializeAttack)
        })

        /**
         * This hook will check if the incoming actor change was to its attacks
         * and trigger an update for all users so their chat card can be re-rendered.
         */
        const settingHookId = Hooks.on('updateSetting', (settingDoc: any, changed: any, options: any, userId: string) => {
            if (settingDoc.key !== "vagabond-lite.attackRegistry") return

            const currentRegistry = getAttackRegistry()

            const targetActorId = attack.actor?.id
            if (!targetActorId || !currentRegistry[targetActorId]) return

            const currentAttacks: AttackSnapshot[] = currentRegistry[targetActorId]
            const snapshot = currentAttacks.find(it => it.id === attack.id)

            if (snapshot && snapshot.targetIds) {
                if (snapshot.userId !== attack.userId) return
                attack.targetIds = [...snapshot.targetIds]
                setTargetIds([...snapshot.targetIds])
            }
        })

        return () => {
            Hooks.off('targetToken', targetHookId)
            Hooks.off('updateSetting', settingHookId)
        }
    }, [attack, attack?.isResolved])

    return targetIds
}