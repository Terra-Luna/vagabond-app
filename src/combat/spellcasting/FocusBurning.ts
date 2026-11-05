import { CountdownManager } from "../../apps/vagabond-tools/usecase/CountdownManager"
import { type FocusInstance, FocusSpellUtil } from "../../model/actor/util/FocusSpellUtil"
import { StatusEffectUtil } from "../../model/actor/util/StatusEffectUtil"
import { appLang } from "../../util/lang"
import { getCanvasToken, getTargetActor } from "../../util/model-util"
import { isImmuneToBurning } from "../engine/util/burning-mitigation"
import { isImmuneToStatus } from "../engine/util/damage-mitigation"
import { isOwnedByFocus } from "./focus-ownership"

/** The starting die of the spell's Burning, or undefined if it has none with a countdown. */
export const burningStartDie = (
  appliedEffects: { effect?: string; duration?: string }[] = [],
): number | undefined => {
  const faces = appliedEffects
    .filter((e) => e.effect === "burning")
    .map((e) => Number(e.duration?.match(/^Cd(\d+)$/)?.[1]))
    .filter((n) => n > 0)
  return faces.length ? Math.max(...faces) : undefined
}

/**
 * Passing upkeep restores the spell's Burning on its targets: existing countdowns return to their starting die
 * (never lowering a larger one), and expired or missing ones are re-applied.
 */
export const restoreBurning = async (actor: any, instance: FocusInstance) => {
  const spell = instance.delivery?.spell
  if (!spell || !instance.delivery?.applyEffect) return
  const initial = burningStartDie(spell.appliedEffects)
  if (!initial) return

  const damageType = spell.damageType === "none" ? undefined : spell.damageType
  const targets = burnTargets(instance.targetIds ?? [])
  const seen = await resetCountdowns(targets, damageType, initial, instance.id)

  for (const [uuid, { target, token }] of targets) {
    if (seen.has(uuid)) continue
    if (isImmuneToStatus(target, "burning")) continue
    if (isImmuneToBurning(target, damageType)) continue
    StatusEffectUtil.toggleStatusEffectOnce(target, "burning", true)
    await CountdownManager.add(
      `${token?.name ?? target.name}: ${appLang.StatusConditions["burning"]?.name ?? "burning"}`,
      initial,
      undefined,
      undefined,
      uuid,
      token?.document?.uuid,
      { id: "burning", damageType, focusId: instance.id },
    )
    // Exempt spells' Burning lingers on its own, so it isn't tied to the Focus and survives a failed check.
    if (spell.focusExempt) continue
    await FocusSpellUtil.record(actor, {
      spell: spell.uuid,
      focusId: instance.id,
      targetUuid: uuid,
      effect: "burning",
      ...(damageType && { damageType }),
    } as any)
  }
}

type BurnTargets = Map<string, { target: any; token: any }>

const burnTargets = (tokenIds: string[]): BurnTargets => {
  const targets: BurnTargets = new Map()
  for (const id of tokenIds) {
    const token = getCanvasToken(id)
    const target = token?.actor ?? getTargetActor(id)
    if (target?.uuid) targets.set(target.uuid, { target, token })
  }
  return targets
}

/** Raises this Focus's existing Burning countdowns on the targets back to `initial`; returns the actors that already had one. */
const resetCountdowns = async (
  targets: BurnTargets,
  damageType: string | undefined,
  initial: number,
  focusId: string,
): Promise<Set<string>> => {
  const seen = new Set<string>()
  let changed = false
  const updated = CountdownManager.getAll().map((cd) => {
    const r = cd.result
    if (
      r.status !== "burning" ||
      !r.actorUuid ||
      !targets.has(r.actorUuid) ||
      (r.damageType ?? undefined) !== damageType ||
      !isOwnedByFocus(r, focusId)
    )
      return cd
    seen.add(r.actorUuid)
    if (r.duration >= initial) return cd
    changed = true
    return { ...cd, result: { ...r, duration: initial } }
  })
  if (changed) await CountdownManager.setAll(updated)
  return seen
}
