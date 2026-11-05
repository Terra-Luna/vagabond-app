import { type FocusInstance, FocusSpellUtil } from "../../model/actor/util/FocusSpellUtil"
import { appLang } from "../../util/lang"
import { LightSourceUtil } from "../../util/LightSourceUtil"
import { localizeString } from "../../util/locale-util"
import { isLightFx, parseLightFx } from "../engine/util/active-effect-fx"
import { isNewEntrant, owesLateCheck } from "./focus-late-check"
import { currentRoundKey } from "./focus-round"
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
  static async evaluate(movedToken?: any, quiet = false) {
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
        if (!FocusLightExposure.isLightBurn(hero, instance)) continue
        await FocusLightExposure.evaluateInstance(hero, instance, {
          combat,
          key,
          movedToken,
          quiet,
        })
      }
    }
  }

  private static async evaluateInstance(
    hero: any,
    it: FocusInstance,
    ctx: { combat: any; key: string; movedToken?: any; quiet: boolean },
  ) {
    const { combat, key, movedToken, quiet } = ctx
    const harmed = LightSourceUtil.harmedHostiles(hero, it.targetIds)
    const entered = movedToken && harmed.includes(movedToken)
    const castThisRound = it.round === combat.round
    const settled = castThisRound || it.paidKey === key

    const newcomer = isNewEntrant(
      entered ? movedToken.id : undefined,
      it.litKey,
      it.litIds,
      key,
    )
    const late = owesLateCheck({
      isNewcomer: newcomer,
      alreadyPaid: !castThisRound && it.paidKey === key,
      lateKey: it.lateKey,
      key,
    })
    await FocusLightExposure.trackLit(hero, it, harmed, key)

    if (late) {
      await FocusSpellUtil.update(hero, it.id, {
        paidKey: undefined,
        doneKey: undefined,
        failedKey: undefined,
        exposedKey: key,
        exposedBy: [movedToken.id],
        lateKey: key,
      })
      if (!quiet) FocusLightExposure.notifyLateCheck(hero)
    }
    else if (settled) {
      await FocusLightExposure.burnEntrants(hero, it, harmed, key, movedToken)
    }
    else if (it.exposedKey !== key) {
      if (!harmed.length) return
      await FocusSpellUtil.update(hero, it.id, {
        exposedKey: key,
        exposedBy: entered ? [movedToken.id] : [],
      })
      if (!quiet) FocusLightExposure.notifyLateCheck(hero)
    }
    else if (entered && !(it.exposedBy ?? []).includes(movedToken.id)) {
      await FocusSpellUtil.update(hero, it.id, {
        exposedBy: [...(it.exposedBy ?? []), movedToken.id],
      })
    }
  }

  private static notifyLateCheck(hero: any) {
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
