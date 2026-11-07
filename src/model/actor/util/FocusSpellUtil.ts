import { CountdownManager } from "../../../apps/vagabond-tools/usecase/CountdownManager"
import { removeFx } from "../../../combat/engine/util/fx-removal"
import { isOwnedByFocus } from "../../../combat/spellcasting/focus-ownership"
import type { SpellDeliverySnapshot } from "../../../combat/spellcasting/SpellDelivery"
import { sys_id } from "../../../util/foundry-util"
import { PolymorphUtil } from "./PolymorphUtil"
import { StatusEffectUtil } from "./StatusEffectUtil"

export type FocusFxRecord = {
  spell: string
  focusId?: string
  targetUuid: string
  effect: string
  damageType?: string
}

/** One Focus point spent on casting a spell. */
export type FocusInstance = {
  id: string
  spell: string
  round?: number
  combatId?: string
  skill?: string
  delivery?: SpellDeliverySnapshot
  targetIds?: string[]
  /** Set for the Polymorph spell: ending this Focus reverts the creatures it polymorphed. */
  polymorph?: boolean
  paidKey?: string
  failedKey?: string
  doneKey?: string
  repeatDamage?: number
  repeatKey?: string
  /** A harmed Hostile entered a Focused light during this round (key), so upkeep is owed; `exposedBy` are the token ids that triggered it. */
  exposedKey?: string
  exposedBy?: string[]
  /** Hostile token ids already inside the Focused light this round (key), so only newcomers owe a late check. */
  litKey?: string
  litIds?: string[]
  /** The one late check this round (key) has been triggered for a newcomer. */
  lateKey?: string
  /** Area Focuses: tokens that became targets but haven't had the spell's effects applied yet (upkeep unpaid). */
  fxPendingIds?: string[]
}

export const FOCUS_FX_FLAG = "focusedSpellFx"
export const FOCUS_SPELLS_FLAG = "focusedSpells"
export const FOCUS_DROP_OPTION = "vagabondDropFocusFx"
const PENDING_FLAG = "focusPendingRelease"

type PendingRelease = {
  combatId: string
  round: number
  records: FocusFxRecord[]
  polymorph?: boolean
}

export class FocusSpellUtil {

  static records(actor: any): FocusFxRecord[] {
    return (actor?.getFlag?.(sys_id, FOCUS_FX_FLAG) as FocusFxRecord[]) ?? []
  }

  static instances(actor: any): FocusInstance[] {
    const stored = (actor?.getFlag?.(sys_id, FOCUS_SPELLS_FLAG) ?? []) as (
      | FocusInstance
      | string
    )[]
    return stored.map((it) =>
      typeof it === "string" ? { id: it, spell: it } : it,
    )
  }

  static find(actor: any, focusId: string): FocusInstance | undefined {
    return FocusSpellUtil.instances(actor).find((it) => it.id === focusId)
  }

  /** Whether any of the scene tokens (by id) is Hostile. */
  static hasHostileToken(tokenIds: string[] = []): boolean {
    return tokenIds.some(
      (id) => canvas?.scene?.tokens.get(id)?.disposition === -1,
    )
  }

  /** Patches one stored Focus instance. */
  static async update(
    actor: any,
    focusId: string,
    patch: Partial<FocusInstance>,
  ) {
    const instances = FocusSpellUtil.instances(actor)
    if (!instances.some((it) => it.id === focusId)) return
    await actor.setFlag(
      sys_id,
      FOCUS_SPELLS_FLAG,
      instances.map((it) => (it.id === focusId ? { ...it, ...patch } : it)),
    )
  }

  static async expireNextRound(
    actor: any,
    entry: Omit<FocusFxRecord, "focusId">,
  ) {
    const combat = FocusSpellUtil.activeCombat()
    if (!combat) return
    const all = FocusSpellUtil.pending(actor)
    const existing = all.find(
      (p) => p.combatId === combat.id && p.round === combat.round,
    )
    const rest = all.filter((p) => p !== existing)
    const records = existing?.records ?? []
    if (
      records.some(
        (r) => r.targetUuid === entry.targetUuid && r.effect === entry.effect,
      )
    )
      return
    await actor.setFlag(sys_id, PENDING_FLAG, [
      ...rest,
      {
        combatId: combat.id,
        round: combat.round,
        records: [...records, entry],
      },
    ])
  }

  /** Remembers an effect that a Focused spell is maintaining on a target. */
  static async record(actor: any, entry: FocusFxRecord) {
    const existing = FocusSpellUtil.records(actor)
    if (
      existing.some(
        (r) =>
          r.focusId === entry.focusId &&
          r.targetUuid === entry.targetUuid &&
          r.effect === entry.effect,
      )
    )
      return
    await actor.setFlag(sys_id, FOCUS_FX_FLAG, [...existing, entry])
  }

  /**
   * Spends a Focus point on a spell. With a single Focus available, spells already being Focused on are dropped right away.
   */
  static async add(
    actor: any,
    spell: string,
    id: string,
    extra?: Pick<
      FocusInstance,
      "skill" | "delivery" | "targetIds" | "polymorph"
    >,
  ) {
    const focus = actor.system.statuses?.counters?.focus ?? 0
    const max = actor.system.maxFocus
    const current = FocusSpellUtil.instances(actor)
    const replacing = focus >= max && max === 1 && current.length > 0
    if (focus >= max && !replacing) return

    const combat = FocusSpellUtil.activeCombat()
    const instance: FocusInstance = {
      id,
      spell,
      ...extra,
      ...(combat && { round: combat.round, combatId: combat.id }),
    }
    const kept = replacing ? [] : current
    const droppedIds = new Set(replacing ? current.map((it) => it.id) : [])
    const records = FocusSpellUtil.records(actor)
    await actor.update(
      {
        "system.statuses.counters.focus":
          focus - (replacing ? current.length : 0) + 1,
        [`flags.${sys_id}.${FOCUS_SPELLS_FLAG}`]: [...kept, instance],
        [`flags.${sys_id}.${FOCUS_FX_FLAG}`]: records.filter(
          (r) => !droppedIds.has(r.focusId ?? ""),
        ),
      },
      {
        [FOCUS_DROP_OPTION]: records.filter((r) =>
          droppedIds.has(r.focusId ?? ""),
        ),
      },
    )
    if (replacing && current.some((it) => it.polymorph)) {
      await PolymorphUtil.releaseAllPolymorphs(actor)
    }
  }

  /** Stops one Focus: refunds the point and removes only the effects it was maintaining. `immediate` skips the end-of-round deferral, which also doesn't apply when dropping during the hero's own turn unless `forceDefer` is set. */
  static async drop(
    actor: any,
    focusId: string,
    immediate = false,
    keepPolymorph = false,
    forceDefer = false,
  ) {
    const instances = FocusSpellUtil.instances(actor)
    const instance = instances.find((it) => it.id === focusId)
    if (!instance) return
    const records = FocusSpellUtil.records(actor)
    const dropped = records.filter((r) => r.focusId === focusId)
    const focus = actor.system.statuses?.counters?.focus ?? 0
    const combat = FocusSpellUtil.activeCombat()
    const isOwnTurn =
      !forceDefer && !!combat && combat.combatant?.actor?.uuid === actor.uuid
    const deferred = !immediate && !isOwnTurn && !!combat && dropped.length > 0
    const releasesPolymorph = !!instance.polymorph && !keepPolymorph
    // A damage break keeps the polymorph, like the other effects, until the round ends.
    const deferPolymorph = releasesPolymorph && forceDefer && !!combat
    await actor.update(
      {
        "system.statuses.counters.focus": Math.max(0, focus - 1),
        [`flags.${sys_id}.${FOCUS_SPELLS_FLAG}`]: instances.filter(
          (it) => it.id !== focusId,
        ),
        [`flags.${sys_id}.${FOCUS_FX_FLAG}`]: records.filter(
          (r) => r.focusId !== focusId,
        ),
        ...((deferred || deferPolymorph) && {
          [`flags.${sys_id}.${PENDING_FLAG}`]: [
            ...FocusSpellUtil.pending(actor),
            {
              combatId: combat.id,
              round: combat.round,
              records: deferred ? dropped : [],
              ...(deferPolymorph && { polymorph: true }),
            },
          ],
        }),
      },
      { [FOCUS_DROP_OPTION]: deferred ? [] : dropped },
    )
    if (releasesPolymorph && !deferPolymorph) {
      await PolymorphUtil.releaseAllPolymorphs(actor)
    }
  }

  /** Ends this Focus's effects on specific targets (by actor uuid) while the Focus continues. Focus-exempt spells keep no records, so their effects are untouched. */
  static async releaseFor(actor: any, focusId: string, targetUuids: string[]) {
    if (!targetUuids.length) return
    const records = FocusSpellUtil.records(actor)
    const ended = records.filter(
      (r) => r.focusId === focusId && targetUuids.includes(r.targetUuid ?? ""),
    )
    if (!ended.length) return
    await actor.update(
      {
        [`flags.${sys_id}.${FOCUS_FX_FLAG}`]: records.filter(
          (r) => !ended.includes(r),
        ),
      },
      { [FOCUS_DROP_OPTION]: ended },
    )
  }

  /** Damage breaks every Focus. In combat the effects linger until the next round starts; out of combat they end now. */
  static async breakAll(actor: any) {
    if (!FocusSpellUtil.activeCombat()) return FocusSpellUtil.clearAll(actor)
    for (const it of FocusSpellUtil.instances(actor)) {
      await FocusSpellUtil.drop(actor, it.id, false, false, true)
    }
    if ((actor.system.statuses?.counters?.focus ?? 0) > 0)
      await actor.update({ "system.statuses.counters.focus": 0 })
  }

  /** Forcefully ends every Focus: releases each one's effects, then wipes any leftover Focus state and the counter. */
  static async clearAll(actor: any) {
    for (const it of FocusSpellUtil.instances(actor)) {
      await FocusSpellUtil.drop(actor, it.id, true)
    }
    await actor.update({ "system.statuses.counters.focus": 0 })
    await actor.unsetFlag(sys_id, FOCUS_SPELLS_FLAG)
    await actor.unsetFlag(sys_id, FOCUS_FX_FLAG)
    await actor.unsetFlag(sys_id, PENDING_FLAG)
  }

  private static activeCombat(): any | undefined {
    const combat = game.combat as any
    return combat?.started ? combat : undefined
  }

  private static pending(actor: any): PendingRelease[] {
    return (actor?.getFlag?.(sys_id, PENDING_FLAG) as PendingRelease[]) ?? []
  }

  /** True while a damage-broken Polymorph Focus is waiting for the round to end. */
  static hasPendingPolymorph(actor: any): boolean {
    return FocusSpellUtil.pending(actor).some((p) => p.polymorph)
  }

  /**
   * Releases a dropped spell's effects now, or at the end of the current round while in combat.
   */
  static async endOrDefer(actor: any, records: FocusFxRecord[]) {
    if (!records.length || !StatusEffectUtil.isDesignatedUser()) return
    const combat = FocusSpellUtil.activeCombat()
    if (!combat) return FocusSpellUtil.release(records)
    await actor.setFlag(sys_id, PENDING_FLAG, [
      ...FocusSpellUtil.pending(actor),
      { combatId: combat.id, round: combat.round, records },
    ])
  }

  /** Releases deferred effects once their round has ended (or their combat is gone). */
  private static async releasePending(combat?: any, combatEnded = false) {
    if (!StatusEffectUtil.isDesignatedUser()) return
    for (const actor of game.actors?.contents ?? []) {
      const all = FocusSpellUtil.pending(actor)
      if (!all.length) continue
      const due = all.filter((p) =>
        combat
          ? p.combatId === combat.id && (combatEnded || p.round < combat.round)
          : !game.combats?.has(p.combatId),
      )
      if (!due.length) continue
      const remaining = all.filter((p) => !due.includes(p))
      if (remaining.length) await actor.setFlag(sys_id, PENDING_FLAG, remaining)
      else await actor.unsetFlag(sys_id, PENDING_FLAG)
      await FocusSpellUtil.release(due.flatMap((p) => p.records))
      const stillPolymorphed = FocusSpellUtil.instances(actor).some(
        (it) => it.polymorph,
      )
      if (due.some((p) => p.polymorph) && !stillPolymorphed)
        await PolymorphUtil.releaseAllPolymorphs(actor)
    }
  }

  static registerHooks() {
    Hooks.on("updateCombat", (combat: any, changed: any) => {
      if ("round" in changed) FocusSpellUtil.releasePending(combat)
    })
    Hooks.on("deleteCombat", (combat: any) =>
      FocusSpellUtil.releasePending(combat, true),
    )
  }

  private static recordKey(r: FocusFxRecord) {
    return [r.focusId, r.targetUuid, r.effect, r.damageType].join("|")
  }

  /** True if another Focus (another caster's, or another of the same caster's) not among `releasing` still maintains the same effect on the same target. */
  private static isMaintainedByOthers(
    record: FocusFxRecord,
    releasing: Set<string>,
  ): boolean {
    return (game.actors?.contents ?? []).some((other: any) =>
      FocusSpellUtil.records(other).some(
        (r) =>
          r.targetUuid === record.targetUuid &&
          r.effect === record.effect &&
          (r.damageType ?? undefined) === (record.damageType ?? undefined) &&
          !releasing.has(FocusSpellUtil.recordKey(r)),
      ),
    )
  }

  static async release(records: FocusFxRecord[]) {
    if (!records?.length || !StatusEffectUtil.isDesignatedUser()) return
    const releasing = new Set(records.map(FocusSpellUtil.recordKey))
    for (const r of records) {
      if (FocusSpellUtil.isMaintainedByOthers(r, releasing)) continue
      const target = (await fromUuid(r.targetUuid as any)) as any
      const actor = target?.actor ?? target
      if (!actor) continue
      if (r.effect === "burning") await FocusSpellUtil.clearBurning(actor, r)
      await removeFx(actor, r.effect)
    }
  }

  /** Removes the Burning countdowns a Focus put on this actor so they don't re-ignite it. */
  private static async clearBurning(actor: any, record: FocusFxRecord) {
    const all = CountdownManager.getAll()
    const remaining = all.filter(
      (cd) =>
        !(
          cd.result.status === "burning" &&
          cd.result.actorUuid === actor.uuid &&
          (cd.result.damageType ?? undefined) ===
            (record.damageType || undefined) &&
          isOwnedByFocus(cd.result, record.focusId)
        ),
    )
    if (remaining.length !== all.length)
      await CountdownManager.setAll(remaining)
  }

}
