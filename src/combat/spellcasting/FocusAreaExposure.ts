import { type FocusInstance, FocusSpellUtil } from "../../model/actor/util/FocusSpellUtil"
import { appLang } from "../../util/lang"
import { getCanvasToken, getTargetActor } from "../../util/model-util"
import { HeroAttack } from "../engine/HeroAttack"
import { PlacedAreaCells } from "./aoe/PlacedAreaCells"
import { AreaOccupants } from "./aoe/targeting/AreaOccupants"
import { currentRoundKey } from "./focus-round"

/**
 * Focused spells with a canvas area follow the same rules as a Focused burning light, except they affect everyone:
 * Hostiles inside the area owe upkeep (and a Cast check), tokens that leave lose the spell's Focus effects, and
 * Hostiles that enter become targets (when the spell has a damage type).
 */
export class FocusAreaExposure {

  static hasArea(instance: FocusInstance): boolean {
    const area = instance.delivery?.area
    return !!area && (!!area.follow || !!area.cells?.length)
  }

  /** The squares the instance's area covers right now. */
  private static cells(instance: FocusInstance) {
    return PlacedAreaCells.of(instance.delivery?.area)
  }

  /** Hostile tokens inside the area that owe upkeep. A friendly spell ignores Hostiles entirely. */
  static hostilesIn(instance: FocusInstance): any[] {
    if (!FocusAreaExposure.hasArea(instance)) return []
    if (FocusAreaExposure.pref(instance) === "friendly") return []
    return AreaOccupants.hostilesIn(FocusAreaExposure.cells(instance))
  }

  /** Tokens currently inside the area that the spell's auto-targeting preference selects. */
  static targetsIn(instance: FocusInstance): any[] {
    return FocusAreaExposure.hasArea(instance)
      ? AreaOccupants.targetsIn(
          FocusAreaExposure.cells(instance),
          FocusAreaExposure.pref(instance),
        )
      : []
  }

  /** Every visible token inside the instance's area, regardless of disposition. */
  static occupantsOf(instance: FocusInstance): any[] {
    return FocusAreaExposure.hasArea(instance)
      ? AreaOccupants.tokensIn(FocusAreaExposure.cells(instance))
      : []
  }

  /** The spell's auto-targeting preference, or undefined when it targets nobody automatically. */
  static autoPref(instance: FocusInstance): string | undefined {
    const pref = FocusAreaExposure.pref(instance)
    return pref === "hostile" || pref === "friendly" || pref === "all"
      ? pref
      : undefined
  }

  /** A placed-area spell whose targets are Friendly and Neutral tokens. */
  static isFriendly(instance: FocusInstance): boolean {
    return (
      FocusAreaExposure.hasArea(instance) &&
      FocusAreaExposure.pref(instance) === "friendly"
    )
  }

  /** Only an Aura lets the caster choose targets, so its spell's preference applies; every other area hits everyone inside. */
  private static pref(instance: FocusInstance): string | undefined {
    if (instance.delivery?.name !== appLang.SpellDeliveries.aura.name)
      return "all"
    return instance.delivery.spell.autoTargetingPref
  }

  /** A Hostile is in the area, or entered it earlier this round, so upkeep and the Cast check are owed. */
  static isExposed(instance: FocusInstance): boolean {
    return (
      instance.exposedKey === currentRoundKey() ||
      FocusAreaExposure.hostilesIn(instance).length > 0
    )
  }

  /** At the top of a round: targets that left the area lose this Focus's effects, and tokens the spell targets that are now inside join them. */
  static async refresh(actor: any, instance: FocusInstance) {
    const cells = FocusAreaExposure.cells(instance)
    if (!cells.length) return
    // Remember who starts the round inside, so a Hostile arriving later is recognised as a newcomer.
    const key = currentRoundKey()
    await FocusSpellUtil.update(actor, instance.id, {
      litKey: key,
      litIds: FocusAreaExposure.hostilesIn(instance).map((t) => t.id as string),
    })
    const inside = new Set(
      AreaOccupants.tokensIn(cells).map((t) => t.document.id as string),
    )
    const current = instance.targetIds ?? []
    const left = current.filter((id) => !!getCanvasToken(id) && !inside.has(id))
    const kept = current.filter((id) => !left.includes(id))
    const fresh = AreaOccupants.targetsIn(
      cells,
      FocusAreaExposure.pref(instance),
    )
      .map((t) => t.document.id as string)
      .filter((id) => !kept.includes(id))

    const uuids = left
      .map((id) => getTargetActor(id)?.uuid)
      .filter((uuid): uuid is string => !!uuid)
    await FocusSpellUtil.releaseFor(actor, instance.id, uuids)
    const friendly = FocusAreaExposure.pref(instance) === "friendly"
    if (!left.length && !fresh.length && !friendly) return
    // Friendly spells never owe upkeep for Hostiles, so everyone who starts the round inside has the buff (re)applied
    // now and keeps it until the next round, even if they walk out of the area.
    const refreshed = friendly
      ? AreaOccupants.targetsIn(cells, "friendly").map(
          (t) => t.document.id as string,
        )
      : []
    await FocusSpellUtil.update(actor, instance.id, {
      targetIds: [...kept, ...fresh],
      fxPendingIds: [
        ...new Set([...(instance.fxPendingIds ?? []), ...fresh, ...refreshed]),
      ],
    })
    if (friendly) await FocusAreaExposure.applyPendingFx(actor, instance.id)
  }

  /** Entrants the spell targets (per its auto-targeting preference) join its targets; their effects are applied once upkeep is settled. */
  static async admit(actor: any, instance: FocusInstance, tokens: any[]) {
    const pref = FocusAreaExposure.pref(instance)
    const known = instance.targetIds ?? []
    const fresh = tokens
      .filter((t) => AreaOccupants.matches(pref, t.document.disposition))
      .map((t) => t.document.id as string)
      .filter((id) => !known.includes(id))
    if (!fresh.length) return
    await FocusSpellUtil.update(actor, instance.id, {
      targetIds: [...known, ...fresh],
      fxPendingIds: [...new Set([...(instance.fxPendingIds ?? []), ...fresh])],
    })
  }

  /** Applies the spell's effects to targets that joined since upkeep was last settled. */
  static async applyPendingFx(actor: any, focusId: string) {
    const instance = FocusSpellUtil.find(actor, focusId)
    const ids = instance?.fxPendingIds ?? []
    if (!instance?.delivery || !ids.length) return
    await FocusSpellUtil.update(actor, focusId, { fxPendingIds: undefined })
    await HeroAttack.applyFocusEffects(actor, instance.delivery, focusId, ids)
  }

}
