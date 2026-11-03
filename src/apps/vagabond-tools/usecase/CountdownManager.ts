import { useEffect, useState } from "react"

import { VagabondActiveEffect } from "../../../combat/documents/VagabondActiveEffect"
import type { VagabondCombatant } from "../../../combat/documents/VagabondCombat"
import { CountdownResult } from "../../../combat/engine/roll/CountdownResult"
import { CountdownRoll } from "../../../combat/engine/roll/CountdownRoll"
import {
  isActiveEffectFx,
  removeActiveEffectCopy,
} from "../../../combat/engine/util/active-effect-fx"
import { isImmuneToBurning } from "../../../combat/engine/util/burning-mitigation"
import { StatusEffectUtil } from "../../../model/actor/util/StatusEffectUtil"
import { sys_id } from "../../../util/foundry-util"
import {
  canInteractWithOverlayObject,
  checkPermissionLevel,
  findOpenOverlaySlots,
  isPermissionLevelEveryone,
  isVisibleInCurrentScene,
  OverlayObjectPermissions,
  updateSetting,
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
  status?: { id: string; damageType?: string; name?: string }
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
    CountdownManager.syncBurningStatuses()
  }

  static syncBurningStatuses() {
    const combatants = game.combat?.combatants.contents as VagabondCombatant[]
    if (combatants) {
      for (const combatant of combatants) {
        combatant.updateBurningStatus()
      }
    }
    CountdownManager.removeStaleBurning()
  }

  /**
   * Removes Burning from actors and tokens (in or out of combat) that no longer have an active burning countdown.
   */
  private static removeStaleBurning() {
    const burning = CountdownManager.getAll()
      .filter((cd) => cd.result.status === "burning" && cd.result.duration > 0)
      .map((cd) => cd.result)

    const targets = new Map<string, { actor: any; tokenUuid?: string }>()
    for (const actor of (game.actors?.contents ?? []) as any[]) {
      targets.set(actor.uuid, { actor })
    }
    for (const token of ((canvas as any)?.tokens?.placeables ?? []) as any[]) {
      if (token.actor)
        targets.set(token.document.uuid, {
          actor: token.actor,
          tokenUuid: token.document.uuid,
        })
    }

    for (const { actor, tokenUuid } of targets.values()) {
      const hasBurningEffect = actor.effects?.some(
        (e: any) =>
          e.statuses?.has?.("burning") || e._id === "vBurning00000000",
      )
      if (!hasBurningEffect) continue
      const stillBurning = burning.some(
        (r) =>
          r.actorUuid === actor.uuid &&
          (!r.tokenUuid || !tokenUuid || r.tokenUuid === tokenUuid),
      )
      if (!stillBurning)
        StatusEffectUtil.toggleStatusEffectOnce(actor, "burning", false)
    }
  }

  static async addAll(allToAdd: CountdownToAdd[]) {
    const countdownsToAdd: CountdownToAdd[] = []
    for (const item of allToAdd) {
      if (item.status?.id === "burning" && item.actorId) {
        const token = item.tokenUuid
          ? ((await fromUuid(item.tokenUuid)) as TokenDocument | null)
          : null
        const actor =
          token?.actor ?? ((await fromUuid(item.actorId)) as Actor | null)
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
      statusName: item.status?.name,
      damageType: item.status?.damageType,
    })

    /**
     * Burning instances are unique by damage type. The other status effects are unique by their actual effect.
     * Discussion: https://discord.com/channels/1347974074084888606/1436416798642671656/1565794389144641630
     */
    const isSameStatus = (
      a: {
        status?: string
        damageType?: string
        actorId?: string
        tokenUuid?: string
      },
      b: {
        status?: string
        damageType?: string
        actorId?: string
        tokenUuid?: string
      },
    ) =>
      !!a.status &&
      a.status === b.status &&
      a.actorId === b.actorId &&
      a.tokenUuid === b.tokenUuid &&
      (a.status !== "burning" ||
        (a.damageType ?? null) === (b.damageType ?? null))

    const flatten = (cd: CountdownSchema) => ({
      status: cd.result.status,
      damageType: cd.result.damageType,
      actorId: cd.result.actorUuid,
      tokenUuid: cd.result.tokenUuid,
    })

    const flattenItem = (item: CountdownToAdd) => ({
      status: item.status?.id,
      damageType: item.status?.damageType,
      actorId: item.actorId,
      tokenUuid: item.tokenUuid,
    })

    const cdsToCreate: CountdownToAdd[] = []

    for (const item of countdownsToAdd) {
      const existingIndex = existing.findIndex((cd) =>
        isSameStatus(flatten(cd), flattenItem(item)),
      )

      if (existingIndex >= 0) {
        if (item.duration > existing[existingIndex].result.duration) {
          existing[existingIndex] = {
            ...existing[existingIndex],
            result: buildResult(item),
          }
        }
        continue
      }
      const pendingIndex = cdsToCreate.findIndex((pending) =>
        isSameStatus(flattenItem(pending), flattenItem(item)),
      )

      if (pendingIndex >= 0) {
        if (item.duration > cdsToCreate[pendingIndex].duration)
          cdsToCreate[pendingIndex] = item
        continue
      }
      cdsToCreate.push(item)
    }

    const slots = findOpenOverlaySlots(
      "countdown",
      existing.filter(isVisibleInCurrentScene),
      cdsToCreate.length,
    )

    const newCountdowns: CountdownSchema[] = cdsToCreate.map((item, index) => {
      const hasPosition = item.x !== undefined || item.y !== undefined
      return {
        id: foundry.utils.randomID(),
        x: hasPosition ? (item.x ?? 0.5) : slots[index].x,
        y: hasPosition ? (item.y ?? 0.5) : slots[index].y,
        centered: false,
        result: buildResult(item),
      }
    })

    await CountdownManager.setAll([...existing, ...newCountdowns])
  }

  static async add(
    label: string,
    duration: number,
    x?: number,
    y?: number,
    actorId?: string,
    tokenUuid?: string,
    status?: { id: string; damageType?: string; name?: string },
  ) {
    return CountdownManager.addAll([
      { label, duration, x, y, actorId, tokenUuid, status },
    ])
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

  private static async clearExpiredStatuses(
    previous: CountdownSchema[],
    next: CountdownSchema[],
  ) {
    const isStatusCd = (cd: CountdownSchema) =>
      !!cd.result.status &&
      cd.result.status !== "burning" &&
      (cd.result.tokenUuid || cd.result.actorUuid)
    const stillActive = new Set(
      next
        .filter((cd) => isStatusCd(cd) && cd.result.duration > 0)
        .map(CountdownManager.statusCountdownKey),
    )
    const toClear = new Map<string, CountdownSchema>()
    for (const cd of previous) {
      if (!isStatusCd(cd) || cd.result.duration <= 0) continue
      const key = CountdownManager.statusCountdownKey(cd)
      if (!stillActive.has(key)) toClear.set(key, cd)
    }
    for (const cd of toClear.values()) {
      const token = cd.result.tokenUuid
        ? ((await fromUuid(cd.result.tokenUuid)) as TokenDocument | null)
        : null
      const actor =
        token?.actor ??
        (cd.result.actorUuid
          ? ((await fromUuid(cd.result.actorUuid)) as Actor | null)
          : null)
      const status = cd.result.status as string
      if (isActiveEffectFx(status)) {
        if (actor) await removeActiveEffectCopy(actor, status)
        continue
      }
      const effectId = VagabondActiveEffect.statusEffects.find(
        (it) => it.id === status,
      )?._id
      const isActive =
        actor?.statuses?.has(status) ||
        (!!effectId && actor?.effects?.has(effectId))
      if (actor && isActive) {
        await StatusEffectUtil.toggleStatusEffectOnce(actor, status, false)
      }
    }
  }

  static removeBurns(actorUuids: (string | null | undefined)[] | Set<string>) {
    const uuidSet = new Set(Array.from(actorUuids).filter(Boolean) as string[])
    if (uuidSet.size === 0) return Promise.resolve(true)
    return CountdownManager.setAll(
      CountdownManager.getAll().filter(
        (countdown) =>
          countdown.result.status !== "burning" ||
          !countdown.result.actorUuid ||
          !uuidSet.has(countdown.result.actorUuid),
      ),
    )
  }

  static removeAllBurns(actorUuid: string | null | undefined) {
    if (!actorUuid) return Promise.resolve(true)
    return CountdownManager.removeBurns([actorUuid])
  }

  private static rolledThisRound = new Set<string>()
  private static rolledListeners = new Set<() => void>()

  private static roundKey(suffix: string) {
    return `${game.combat?.id}:${game.combat?.round}:${suffix}`
  }

  static groupRolledKey(groupName: string) {
    return CountdownManager.roundKey(`group:${groupName}`)
  }

  static dieRolledKey(cdId: string) {
    return CountdownManager.roundKey(`die:${cdId}`)
  }

  static wasRolled(key: string) {
    return CountdownManager.rolledThisRound.has(key)
  }

  static markRolled(key: string) {
    CountdownManager.rolledThisRound.add(key)
    CountdownManager.rolledListeners.forEach((listener) => listener())
  }

  static useRolledTracking() {
    const [, forceRender] = useState(0)
    useEffect(() => {
      const listener = () => forceRender((n) => n + 1)
      CountdownManager.rolledListeners.add(listener)
      // re-render on round changes so buttons re-enable
      const hookId = Hooks.on("updateCombat", listener)
      return () => {
        CountdownManager.rolledListeners.delete(listener)
        Hooks.off("updateCombat", hookId)
      }
    }, [])
  }

  static async rollStatusCountdown(cdId: string) {
    const current = CountdownManager.getAll().find((cd) => cd.id === cdId)
    if (!current || current.result.duration === 0) return
    if (
      !canInteractWithOverlayObject(current, CountdownManager.checkPermission)
    )
      return

    const roll = new CountdownRoll(current.result)
    await roll.roll(true)

    const expired = roll.result.duration === 0
    await CountdownManager.setAll(
      CountdownManager.getAll().flatMap((cd) =>
        cd.id !== cdId ? [cd] : expired ? [] : [{ ...cd, result: roll.result }],
      ),
    )

    if (current.result.status === "burning") await roll.applyBurningDamage()
  }

  static getCombatantStatusCountdowns(
    cds: CountdownSchema[],
    combatant: VagabondCombatant,
  ) {
    return cds.filter(
      (cd) =>
        cd.result.status &&
        cd.result.duration > 0 &&
        cd.result.actorUuid === combatant.actor?.uuid &&
        (!cd.result.tokenUuid || cd.result.tokenUuid === combatant.token?.uuid),
    )
  }

  static async rollPendingCountdowns(combatant: VagabondCombatant) {
    if (
      CountdownManager.wasRolled(
        CountdownManager.groupRolledKey(combatant.combatGroup),
      )
    )
      return
    const pending = CountdownManager.getCombatantStatusCountdowns(
      CountdownManager.getAll(),
      combatant,
    )
      .map((cd) => cd.id)
      .filter(
        (id) => !CountdownManager.wasRolled(CountdownManager.dieRolledKey(id)),
      )
    pending.forEach((id) =>
      CountdownManager.markRolled(CountdownManager.dieRolledKey(id)),
    )
    for (const id of pending) {
      await CountdownManager.rollStatusCountdown(id)
    }
  }

  static async activateCombatantAndRollCountdowns(
    combatant: VagabondCombatant,
  ) {
    const id = combatant?._id
    if (!id) return
    await (game.combat as any)?.activateCombatant(id)
    if (game.user?.isActiveGM) {
      await CountdownManager.rollPendingCountdowns(combatant)
    }
    else if (game.users?.activeGM) {
      // Players can't roll countdowns themselves; ask the active GM's client to.
      game.socket?.emit(`system.${sys_id}`, {
        action: "rollCombatantCountdowns",
        user: game.user?.id,
        data: { combatId: game.combat?.id, combatantId: id },
      })
    }
  }
}
