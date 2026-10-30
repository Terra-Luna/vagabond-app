import type { VagabondCombatant } from "../../../combat/documents/VagabondCombat"
import { CountdownResult } from "../../../combat/engine/roll/CountdownResult"
import { isImmuneToBurning } from "../../../combat/engine/util/burning-mitigation"
import { sys_id } from "../../../utils/foundryUtils"
import {
    checkPermissionLevel, findOpenOverlaySlots, isPermissionLevelEveryone, isVisibleInCurrentScene, OverlayObjectPermissions, updateSetting
} from "./VagabondSettingsHelper"

export interface CountdownSchema extends OverlayObjectPermissions {
    id: string
    x: number
    y: number
    label?: string
    result: CountdownResult
}

export interface CountdownToAdd {
    label: string
    duration: number
    x?: number
    y?: number
    actorId?: string
    tokenUuid?: string
    status?: { id: string, damageType?: string }
}

/**
 * Countdown roll management helper class.
 */
export class CountdownManager {

    static getAll(): CountdownSchema[] {
        return (game.settings as any)?.get(sys_id, "countdowns") || []
    }

    static async setAll(countdowns: CountdownSchema[]) {
        const previous = CountdownManager.getAll()
        await updateSetting("countdowns", countdowns)
        await CountdownManager.clearExpiredStatuses(previous, countdowns)
        const combatants = game.combat?.combatants.contents as VagabondCombatant[]
        if (combatants) {
            for (const combatant of combatants) {
                combatant.updateBurningStatus()
            }
        }
    }

    static async addAll(allToAdd: CountdownToAdd[]) {
        const countdownsToAdd: CountdownToAdd[] = []
        for (const item of allToAdd) {
            if (item.status?.id === "burning" && item.actorId) {
                const token = item.tokenUuid ? await fromUuid(item.tokenUuid) as TokenDocument | null : null
                const actor = token?.actor ?? await fromUuid(item.actorId) as Actor | null
                if (isImmuneToBurning(actor, item.status.damageType)) continue
            }
            countdownsToAdd.push(item)
        }
        if (!countdownsToAdd.length) return
        const existing = [...CountdownManager.getAll()]

        const buildResult = (item: CountdownToAdd): CountdownResult => ({
            actorUuid: item.actorId,
            tokenUuid: item.tokenUuid,
            name: item.label,
            duration: item.duration,
            status: item.status?.id,
            damageType: item.status?.damageType
        })

        /**
         * Burning instances are unique by damage type. The other status effects are unique by their actual effect.
         * Discussion: https://discord.com/channels/1347974074084888606/1436416798642671656/1565794389144641630
         */
        const isSameStatus = (
            a: { status?: string, damageType?: string, actorId?: string, tokenUuid?: string },
            b: { status?: string, damageType?: string, actorId?: string, tokenUuid?: string }
        ) =>
            !!a.status && a.status === b.status &&
            a.actorId === b.actorId && a.tokenUuid === b.tokenUuid &&
            (a.status !== "burning" || (a.damageType ?? null) === (b.damageType ?? null))
        
        const flatten = (cd: CountdownSchema) => ({
            status: cd.result.status, damageType: cd.result.damageType,
            actorId: cd.result.actorUuid, tokenUuid: cd.result.tokenUuid
        })
        
        const flattenItem = (item: CountdownToAdd) => ({
            status: item.status?.id, damageType: item.status?.damageType,
            actorId: item.actorId, tokenUuid: item.tokenUuid
        })

        const cdsToCreate: CountdownToAdd[] = []

        for (const item of countdownsToAdd) {
            const existingIndex = existing.findIndex(cd => isSameStatus(flatten(cd), flattenItem(item)))

            if (existingIndex >= 0) {
                if (item.duration > existing[existingIndex].result.duration) {
                    existing[existingIndex] = { ...existing[existingIndex], result: buildResult(item) }
                }
                continue
            }
            const pendingIndex = cdsToCreate.findIndex(pending => isSameStatus(flattenItem(pending), flattenItem(item)))

            if (pendingIndex >= 0) {
                if (item.duration > cdsToCreate[pendingIndex].duration) cdsToCreate[pendingIndex] = item
                continue
            }
            cdsToCreate.push(item)
        }

        const slots = findOpenOverlaySlots("countdown", existing.filter(isVisibleInCurrentScene), cdsToCreate.length)

        const newCountdowns: CountdownSchema[] = cdsToCreate.map((item, index) => {
            const hasPosition = item.x !== undefined || item.y !== undefined
            return {
                id: foundry.utils.randomID(),
                x: hasPosition ? item.x ?? 0.5 : slots[index].x,
                y: hasPosition ? item.y ?? 0.5 : slots[index].y,
                centered: false,
                result: buildResult(item)
            }
        })

        await CountdownManager.setAll([...existing, ...newCountdowns])
    }

    static async add(
        label: string,
        duration: number, x?: number, y?: number,
        actorId?: string, tokenUuid?: string,
        status?: { id: string, damageType?: string }
    ) {
        return CountdownManager.addAll([{ label, duration, x, y, actorId, tokenUuid, status }])
    }

    static deleteAll() {
        return CountdownManager.setAll([])
    }

    static checkPermission(): boolean {
        return checkPermissionLevel("countdownPermissionLevel")
    }

    static checkPlayerDefaultPermission(): boolean {
        return isPermissionLevelEveryone("countdownPermissionLevel")
    }

    private static statusCountdownKey(cd: CountdownSchema) {
        return `${cd.result.tokenUuid ?? ""}|${cd.result.actorUuid ?? ""}|${cd.result.status}`
    }

    private static async clearExpiredStatuses(previous: CountdownSchema[], next: CountdownSchema[]) {
        const isStatusCd = (cd: CountdownSchema) => !!cd.result.status && cd.result.status !== "burning" && (cd.result.tokenUuid || cd.result.actorUuid)
        const stillActive = new Set(next.filter(cd => isStatusCd(cd) && cd.result.duration > 0).map(CountdownManager.statusCountdownKey))
        const toClear = new Map<string, CountdownSchema>()
        for (const cd of previous) {
            if (!isStatusCd(cd) || cd.result.duration <= 0) continue
            const key = CountdownManager.statusCountdownKey(cd)
            if (!stillActive.has(key)) toClear.set(key, cd)
        }
        for (const cd of toClear.values()) {
            const token = cd.result.tokenUuid ? await fromUuid(cd.result.tokenUuid) as TokenDocument | null : null
            const actor = token?.actor ?? (cd.result.actorUuid ? await fromUuid(cd.result.actorUuid) as Actor | null : null)
            if (actor?.statuses?.has(cd.result.status as string)) {
                await actor.toggleStatusEffect(cd.result.status as string, { active: false })
            }
        }
    }

    static removeBurns(actorUuids: (string | null | undefined)[] | Set<string>) {
        const uuidSet = new Set(Array.from(actorUuids).filter(Boolean) as string[])
        if (uuidSet.size === 0) return Promise.resolve(true)
        return CountdownManager.setAll(CountdownManager.getAll().filter(countdown => countdown.result.status !== "burning" || !countdown.result.actorUuid || !uuidSet.has(countdown.result.actorUuid)))
    }

    static removeAllBurns(actorUuid: string | null | undefined) {
        if (!actorUuid) return Promise.resolve(true)
        return CountdownManager.removeBurns([actorUuid])
    }

}