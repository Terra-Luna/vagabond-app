import { type FocusInstance, FocusSpellUtil } from "../../model/actor/util/FocusSpellUtil"
import { appLang } from "../../util/lang"
import { LightSourceUtil } from "../../util/LightSourceUtil"
import { localizeString } from "../../util/locale-util"
import { isLightFx, parseLightFx } from "../engine/util/active-effect-fx"
import { isNewEntrant, owesLateCheck } from "./focus-late-check"
import { currentRoundKey } from "./focus-round"
import { FocusAreaExposure } from "./FocusAreaExposure"
import { FocusSurface } from "./FocusSurface"
import { FocusUpkeep } from "./FocusUpkeep"

/**
 * Focused light that harms Hostiles (sunlight, moonlight, or a light that burns something): a harmed Hostile
 * entering it mid-round makes upkeep owed, even for a Focus that was otherwise free that round.
 */
export class FocusLightExposure {

  // ---------------------------------------------------------------------------
  // Queries
  // ---------------------------------------------------------------------------

  /** A Focused light that is sunlight/moonlight or burns something: Hostiles it harms can become new targets mid-round. */
  static isLightBurn(actor: any, instance: FocusInstance): boolean {
    return FocusSpellUtil.records(actor).some((r) => {
      if (r.focusId !== instance.id || !isLightFx(r.effect)) return false
      const light = parseLightFx(r.effect)
      return light.type !== "basic" || light.burns.length > 0
    })
  }

  /** A harmed Hostile entered the light this round, so its upkeep is owed (set once per round by `evaluate`). */
  static isExposed(actor: any, instance: FocusInstance): boolean {
    return (
      instance.exposedKey === currentRoundKey() &&
      FocusLightExposure.isLightBurn(actor, instance)
    )
  }

  static hasUnresolvedLightBurn(): boolean {
    return (game.actors?.contents ?? []).some(
      (a: any) =>
        a.type === "hero" &&
        FocusUpkeep.unresolvedInstances(a).some((it) =>
          FocusLightExposure.isLightBurn(a, it),
        ),
    )
  }

  // ---------------------------------------------------------------------------
  // Evaluation (GM side)
  // ---------------------------------------------------------------------------

  /**
   * For each Hero's Focused burning light: once per round, a harmed Hostile in range makes the upkeep and Cast check owed.
   * When the upkeep is already settled this round, a Hostile that just moved in takes the light's damage immediately,
   * as do Hostiles whose entry is what triggered an upkeep that has since been paid.
   */
  /** Evaluations queue up so overlapping triggers (several tokens moving at once) never act on stale instances. */
  private static queue: Promise<unknown> = Promise.resolve()

  static evaluate(movedToken?: any, quiet = false): Promise<void> {
    return FocusLightExposure.enqueue(() =>
      FocusLightExposure.evaluateNow(movedToken, quiet),
    )
  }

  /** Refresh and evaluate together so actor and token hooks cannot race the round-start updates. */
  static evaluateRound(combat: any, round: number): Promise<void> {
    return FocusLightExposure.enqueue(async () => {
      if (
        game.combat?.id !== combat.id ||
        combat.round !== round ||
        !combat.started
      )
        return
      await FocusUpkeep.refreshAreas()
      if (
        game.combat?.id !== combat.id ||
        combat.round !== round ||
        !combat.started
      )
        return
      await FocusSurface.startOfRound()
      if (
        game.combat?.id !== combat.id ||
        combat.round !== round ||
        !combat.started
      )
        return
      await FocusLightExposure.evaluateNow(undefined, true)
    })
  }

  private static enqueue(work: () => Promise<void>): Promise<void> {
    const run = FocusLightExposure.queue.then(work)
    FocusLightExposure.queue = run.catch((e) =>
      console.error("Focus exposure evaluation failed", e),
    )
    return run
  }

  private static async evaluateNow(movedToken?: any, quiet = false) {
    const combat = game.combat as any
    if (!game.user?.isActiveGM || !canvas?.ready || !combat?.started) return
    if (movedToken) {
      await LightSourceUtil.settleAnimations([movedToken])
      if (!canvas?.ready) return
    }
    const key = currentRoundKey()
    const heroes = (game.actors?.contents ?? []).filter(
      (a: any) => a.type === "hero",
    )
    for (const hero of heroes) {
      for (const instance of FocusSpellUtil.instances(hero)) {
        if (
          !FocusLightExposure.isLightBurn(hero, instance) &&
          !FocusAreaExposure.hasArea(instance)
        )
          continue
        await FocusLightExposure.evaluateInstance(hero, instance, {
          combat,
          key,
          movedToken,
          quiet,
        })
        // The Focus may have ended during evaluation (nothing then to surface).
        const current = FocusSpellUtil.find(hero, instance.id)
        if (current) await FocusSurface.onMove(hero, current)
      }
    }
  }

  private static async evaluateInstance(
    hero: any,
    it: FocusInstance,
    ctx: { combat: any; key: string; movedToken?: any; quiet: boolean },
  ) {
    const { combat, key, movedToken, quiet } = ctx
    const isArea = FocusAreaExposure.hasArea(it)
    const harmed = FocusLightExposure.harmedBy(hero, it)
    const baseline = it.litKey === key ? (it.litIds ?? []) : undefined
    // Areas also catch Hostiles that were carried in (e.g. the caster moved), not just ones that moved themselves.
    const entrants = harmed.filter(
      (t) =>
        t === movedToken || (isArea && !!baseline && !baseline.includes(t.id)),
    )
    const entered = entrants.length > 0
    const castThisRound = it.combatId === combat.id && it.round === combat.round
    const settled = castThisRound || it.paidKey === key

    const newcomer = entrants.some((t) =>
      isNewEntrant(t.id, it.litKey, it.litIds, key),
    )
    // A late check is owed once per round per spellcast, however many separate squares an area has, so only the
    // first newcomer (not one that was inside when the round began) triggers it; `lateKey` blocks the rest.
    // Cast with nobody to check against (no Hostile in range yet): the first one arriving later this round owes the check.
    const uncheckedCast =
      castThisRound && it.litKey === key && !(it.litIds ?? []).length
    const late = owesLateCheck({
      isNewcomer: newcomer,
      alreadyPaid: (!castThisRound && it.paidKey === key) || uncheckedCast,
      lateKey: it.lateKey,
      key,
    })
    await FocusLightExposure.trackLit(hero, it, harmed, key)
    if (isArea && entered) await FocusAreaExposure.admit(hero, it, entrants)

    if (late) {
      await FocusSpellUtil.update(hero, it.id, {
        paidKey: undefined,
        doneKey: undefined,
        failedKey: undefined,
        exposedKey: key,
        exposedBy: entrants.map((t) => t.id as string),
        lateKey: key,
      })
      if (!quiet) FocusLightExposure.notifyLateCheck(hero, it, key)
    }
    else if (settled) {
      if (isArea) await FocusAreaExposure.applyPendingFx(hero, it.id)
      else
        await FocusLightExposure.burnEntrants(hero, it, harmed, key, movedToken)
    }
    else if (it.exposedKey !== key) {
      if (!harmed.length) return
      await FocusSpellUtil.update(hero, it.id, {
        exposedKey: key,
        exposedBy: entrants.map((t) => t.id as string),
      })
      if (!quiet) FocusLightExposure.notifyLateCheck(hero, it, key)
    }
    else if (entered) {
      const known = it.exposedBy ?? []
      const added = entrants
        .map((t) => t.id as string)
        .filter((id) => !known.includes(id))
      if (added.length)
        await FocusSpellUtil.update(hero, it.id, {
          exposedBy: [...known, ...added],
        })
    }
  }

  /** Hostiles that make this Focus owe upkeep: those a burning light harms, and anyone in a placed area. */
  private static harmedBy(hero: any, it: FocusInstance): any[] {
    const light = FocusLightExposure.isLightBurn(hero, it)
      ? LightSourceUtil.harmedHostiles(hero, it.targetIds)
      : []
    const inArea = FocusAreaExposure.hostilesIn(it)
    return [...new Set([...light, ...inArea])]
  }

  private static readonly notified = new Set<string>()

  /** Shown once per hero, Focus and round, however many times the check is re-evaluated. */
  private static notifyLateCheck(hero: any, it: FocusInstance, key: string) {
    const id = `${hero.id}:${it.id}:${key}`
    if (FocusLightExposure.notified.has(id)) return
    FocusLightExposure.notified.add(id)
    ui.notifications?.info(
      localizeString(appLang.Spellcasting.focusLateCheck, {
        name: hero.name ?? "",
      }),
    )
  }

  /** Remembers which Hostiles are inside the light this round, so later arrivals can be told apart. */
  private static async trackLit(
    hero: any,
    it: FocusInstance,
    harmed: any[],
    key: string,
  ) {
    const known = it.litKey === key ? (it.litIds ?? []) : []
    const ids = [...new Set([...known, ...harmed.map((t) => t.id as string)])]
    if (it.litKey === key && ids.length === known.length) return
    await FocusSpellUtil.update(hero, it.id, { litKey: key, litIds: ids })
  }

  /** Upkeep is settled: the Hostile that just moved in, and any whose entry triggered the paid upkeep, take the light's damage now. */
  private static async burnEntrants(
    hero: any,
    it: FocusInstance,
    harmed: any[],
    key: string,
    movedToken?: any,
  ) {
    const pending = it.exposedKey === key ? (it.exposedBy ?? []) : []
    const burn = new Set(
      harmed.filter((t) => pending.includes(t.id) || t === movedToken),
    )
    for (const token of burn) await LightSourceUtil.burnToken(token)
    if (pending.length)
      await FocusSpellUtil.update(hero, it.id, { exposedBy: undefined })
  }

}
