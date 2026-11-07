import { getAllowLateLuckStudy, getManaEnforcement } from "../../apps/vagabond-tools/usecase/VagabondSettingsHelper"
import { type FocusInstance, FocusSpellUtil } from "../../model/actor/util/FocusSpellUtil"
import { roll3dDice } from "../../util/foundry-util"
import { appLang } from "../../util/lang"
import { sendVagabondChatCard } from "../../view/chat/ChatCardSerializer"
import { SkillCheck } from "../engine/roll/SkillCheck"
import { isLightFx } from "../engine/util/active-effect-fx"
import { currentRoundKey, roundKey } from "./focus-round"
import { FocusAreaExposure } from "./FocusAreaExposure"
import { restoreBurning } from "./FocusBurning"
import { FocusLightExposure } from "./FocusLightExposure"
import { dealRepeatDamage, maxRepeatDice } from "./FocusRepeatDamage"

export type UpkeepResult =
  | "passed"
  | "failed"
  | "pending"
  | "noMana"
  | "missing"

/**
 * Each combat round a caster must pay 1 mana and pass a Cast check to keep a Focus that affects Hostile
 * creatures (or a Focused damaging spell they may repeat). Failing, or declining, ends that Focus immediately.
 * The FocusManagerApp drives the UI; this class holds the rules.
 */
export class FocusUpkeep {

  /** Whether the spell has a damage base type, so the caster may repeat its damage even if first cast for effect only. */
  static canRepeatDamage(instance: FocusInstance): boolean {
    // A late check this round is a second payment; damage is only offered once per round.
    if (instance.lateKey && instance.lateKey === FocusUpkeep.currentKey())
      return false
    const type = instance.delivery?.spell.damageType
    if (!type || type === "none") return false
    // A placed area offers damage only when it has applicable targets inside right now.
    if (
      FocusAreaExposure.hasArea(instance) &&
      FocusAreaExposure.autoPref(instance)
    )
      return FocusAreaExposure.targetsIn(instance).length > 0
    return FocusSpellUtil.hasHostileToken(instance.targetIds)
  }

  static isDamaging(instance: FocusInstance): boolean {
    const delivery = instance.delivery
    return (
      !!delivery &&
      delivery.spell.damageType !== "none" &&
      delivery.spell.damageType !== "healing" &&
      (delivery.damageDice ?? 0) > 0
    )
  }

  private static hasHostileTarget(
    actor: any,
    instance: FocusInstance,
  ): boolean {
    const tokens = (canvas?.scene?.tokens?.contents ?? []) as any[]
    if (FocusSpellUtil.hasHostileToken(instance.targetIds)) return true
    return FocusSpellUtil.records(actor)
      .filter((r) => r.focusId === instance.id && !isLightFx(r.effect))
      .some((r) =>
        tokens.some(
          (t) => t.disposition === -1 && t.actor?.uuid === r.targetUuid,
        ),
      )
  }

  static currentKey(): string {
    return currentRoundKey()
  }

  static roundKey(round: number): string {
    return roundKey(round)
  }

  static hasUnresolvedLightBurn(): boolean {
    return FocusLightExposure.hasUnresolvedLightBurn()
  }

  /** GM-side: see {@link FocusLightExposure.evaluate}. */
  static evaluateExposures(movedToken?: any, quiet = false) {
    return FocusLightExposure.evaluate(movedToken, quiet)
  }

  /** Refresh areas and evaluate exposure atomically with respect to other exposure checks. */
  static evaluateRound(combat: any, round: number) {
    return FocusLightExposure.evaluateRound(combat, round)
  }

  /** A spell that burns (a Burning effect, or a burning light with a harmed Hostile newly in range) owes upkeep when Focused with its effect applied. */
  private static causesBurning(actor: any, instance: FocusInstance): boolean {
    const spell = instance.delivery?.spell
    const direct =
      !!spell &&
      !!instance.delivery?.applyEffect &&
      !!spell.appliedEffects?.some((e) => e.effect === "burning")
    return direct || FocusLightExposure.isExposed(actor, instance)
  }

  /** The upkeep setting from the cast's snapshot, or from the spell item for Focuses with no delivery (e.g. Polymorph). */
  private static upkeepOf(
    instance: FocusInstance,
  ): { force: boolean; perTarget: boolean } | undefined {
    if (instance.delivery) return instance.delivery.spell.upkeep
    return (fromUuidSync(instance.spell) as any)?.system?.upkeep
  }

  /** Mana owed for upkeep: 1, or 1 per target for spells that charge per target. */
  static upkeepCost(instance: FocusInstance): number {
    const upkeep = FocusUpkeep.upkeepOf(instance)
    if (!upkeep?.force || !upkeep.perTarget) return 1
    return Math.max(1, instance.targetIds?.length ?? 1)
  }

  /** Forced upkeep spells always cost mana each round, even with no Hostile involved. */
  private static isForced(instance: FocusInstance): boolean {
    return !!FocusUpkeep.upkeepOf(instance)?.force
  }

  static needsUpkeep(actor: any, instance: FocusInstance): boolean {
    return (
      FocusUpkeep.isForced(instance) || FocusUpkeep.needsCheck(actor, instance)
    )
  }

  /** The Cast check only applies by the normal rules: damage, burning or a Hostile target. */
  static needsCheck(actor: any, instance: FocusInstance): boolean {
    // Areas stay free while no Hostile is inside, like a Focused light.
    if (FocusAreaExposure.hasArea(instance))
      return FocusAreaExposure.isExposed(instance)
    return (
      FocusUpkeep.isDamaging(instance) ||
      FocusUpkeep.causesBurning(actor, instance) ||
      FocusUpkeep.hasHostileTarget(actor, instance)
    )
  }

  static async markDone(actor: any, focusId: string, round: number) {
    await FocusSpellUtil.update(actor, focusId, {
      doneKey: FocusUpkeep.roundKey(round),
    })
  }

  /** Focus instances that owe upkeep at the start of `round` (ones cast this round, or already handled, don't). */
  static dueInstances(actor: any, round: number): FocusInstance[] {
    const key = FocusUpkeep.roundKey(round)
    return FocusSpellUtil.instances(actor).filter(
      (it) =>
        (it.combatId !== game.combat?.id ||
          it.round !== round ||
          it.lateKey === key) &&
        it.doneKey !== key &&
        (FocusUpkeep.needsUpkeep(actor, it) || FocusUpkeep.canRepeatDamage(it)),
    )
  }

  /** Focus instances whose upkeep this round is still unresolved (unpaid, or awaiting a failed check's decision). */
  static unresolvedInstances(actor: any): FocusInstance[] {
    if (!game.combat?.started) return []
    const round = game.combat.round
    const key = FocusUpkeep.roundKey(round)
    return FocusSpellUtil.instances(actor).filter(
      (it) =>
        (it.combatId !== game.combat?.id ||
          it.round !== round ||
          it.lateKey === key) &&
        it.doneKey !== key &&
        FocusUpkeep.needsUpkeep(actor, it) &&
        (it.paidKey !== key || FocusUpkeep.hasPendingCheck(it.id)),
    )
  }

  /** Set by the Focus app so the engine can open it without importing the UI. */
  static openManager?: (actor: any) => void

  /** Blocks attacks and casting while Focus upkeep is unresolved, opening the Focus app instead. */
  static blocksActions(actor: any): boolean {
    if (!FocusUpkeep.unresolvedInstances(actor).length) return false
    FocusUpkeep.openManager?.(actor)
    return true
  }

  /** A Hostile took the spotlight: every Hero's Focus that hasn't passed its upkeep this round ends, with its effects. */
  static async dropUnresolvedForHostileTurn() {
    const heroes = (game.actors?.contents ?? []).filter(
      (a: any) => a.type === "hero",
    )
    for (const hero of heroes) {
      for (const it of FocusUpkeep.unresolvedInstances(hero)) {
        await FocusUpkeep.decline(hero, it.id)
      }
    }
  }

  /** The caster declines (or can't afford) upkeep: the Focus and its effects end immediately. */
  static async decline(actor: any, focusId: string) {
    await FocusSpellUtil.drop(actor, focusId, true)
  }

  /** Cast checks awaiting the caster's luck/study decision after a failure, keyed by Focus id. */
  private static pendingChecks = new Map<string, SkillCheck>()
  private static rerolled = new Set<string>()

  static hasPendingCheck(focusId: string): boolean {
    return FocusUpkeep.pendingChecks.has(focusId)
  }

  private static async spend(actor: any, resource: "luck" | "studied") {
    const value = actor.system.statuses.counters[resource] ?? 0
    if (value < 1) return false
    await actor.update(
      { [`system.statuses.counters.${resource}`]: value - 1 },
      { ["skipTrackerChatCard" as string]: true },
    )
    return true
  }

  private static postCheck(actor: any, check: SkillCheck, focusId: string) {
    const result = check.result!
    const spell = FocusSpellUtil.find(actor, focusId)?.delivery?.spell
    return sendVagabondChatCard(
      actor,
      "SkillCheckChatCard",
      {
        actorId: actor.id ?? "",
        result,
        focusTitle: appLang.Spellcasting.focusCheck,
        icon: spell?.img,
      },
      result.rolls,
    )
  }

  static canAfford(actor: any, instance: FocusInstance): boolean {
    return (
      !getManaEnforcement() ||
      actor.system.mana.value >= FocusUpkeep.upkeepCost(instance)
    )
  }

  /** Pays 1 mana and rolls the Cast check, optionally spending Luck or a Studied die first for Favor. */
  static async pay(
    actor: any,
    focusId: string,
    round: number,
    favorWith?: "luck" | "studied",
    modifier?: "favor" | "hinder",
  ): Promise<UpkeepResult> {
    const instance = FocusSpellUtil.find(actor, focusId)
    if (!instance) return "missing"
    const hero = actor.system
    const cost = FocusUpkeep.upkeepCost(instance)
    if (getManaEnforcement() && hero.mana.value < cost) {
      ui.notifications?.warn(appLang.Spellcasting.focusUpkeepNoMana)
      return "noMana"
    }
    const needsCheck = FocusUpkeep.needsCheck(actor, instance)
    // Shift/Ctrl are free; they take precedence over a paid Favor.
    const favored =
      needsCheck &&
      !modifier &&
      !!favorWith &&
      (await FocusUpkeep.spend(actor, favorWith))
    await actor.update({
      "system.mana.value": Math.max(0, hero.mana.value - cost),
    })

    if (!needsCheck) {
      await FocusUpkeep.conclude(actor, instance, round)
      return "passed"
    }

    const skill = instance.skill ?? hero.class?.castingSkill ?? "arcana"
    const check = new SkillCheck(hero, { type: "cast", skill })
    if (modifier) check.favorHinder = modifier
    else if (favored) check.favorHinder = check.isHindered ? "none" : "favor"
    await check.roll()
    await FocusUpkeep.postCheck(actor, check, focusId)

    if (check.result?.outcome === appLang.RollResult.failure) {
      FocusUpkeep.pendingChecks.set(focusId, check)
      await FocusSpellUtil.update(actor, focusId, {
        failedKey: FocusUpkeep.roundKey(round),
      })
      return "pending"
    }
    await FocusUpkeep.conclude(actor, instance, round)
    return "passed"
  }

  private static async conclude(
    actor: any,
    instance: FocusInstance,
    round: number,
  ) {
    await restoreBurning(actor, instance)
    const key = FocusUpkeep.roundKey(round)
    FocusUpkeep.pendingChecks.delete(instance.id)
    await FocusSpellUtil.update(actor, instance.id, {
      paidKey: key,
      failedKey: undefined,
      ...(!FocusUpkeep.canRepeatDamage(instance) && { doneKey: key }),
    })
    await FocusAreaExposure.applyPendingFx(actor, instance.id)
  }

  /** At the top of a round (GM): each Focused area drops targets that left and re-acquires Hostiles inside. */
  static async refreshAreas() {
    if (!game.user?.isActiveGM || !canvas?.ready) return
    for (const hero of game.actors?.contents ?? []) {
      if ((hero as any).type !== "hero") continue
      for (const it of FocusSpellUtil.instances(hero)) {
        if (FocusAreaExposure.hasArea(it))
          await FocusAreaExposure.refresh(hero, it)
      }
    }
  }

  /** After a failed check, the caster accepts it: the Focus and its effects end. */
  static async failFocus(actor: any, focusId: string) {
    FocusUpkeep.pendingChecks.delete(focusId)
    FocusUpkeep.rerolled.delete(focusId)
    ui.notifications?.warn(appLang.Spellcasting.focusUpkeepFailed)
    await FocusSpellUtil.drop(actor, focusId, true)
  }

  private static async afterRescue(
    actor: any,
    focusId: string,
    check: SkillCheck,
    round: number,
  ): Promise<UpkeepResult> {
    await FocusUpkeep.postCheck(actor, check, focusId)
    if (check.result?.outcome === appLang.RollResult.failure) {
      // Nothing left to try: the failure stands.
      if (!FocusUpkeep.canRescue(actor, focusId)) {
        await FocusUpkeep.failFocus(actor, focusId)
        return "failed"
      }
      return "pending"
    }
    const instance = FocusSpellUtil.find(actor, focusId)
    if (!instance) return "missing"
    FocusUpkeep.rerolled.delete(focusId)
    await FocusUpkeep.conclude(actor, instance, round)
    return "passed"
  }

  static hasRerolled(focusId: string): boolean {
    return FocusUpkeep.rerolled.has(focusId)
  }

  /** Whether a late Favor d6 can still be added to the failed check. */
  static canLateFavor(actor: any, focusId: string): boolean {
    const check = FocusUpkeep.pendingChecks.get(focusId)
    return (
      getAllowLateLuckStudy() &&
      !!check &&
      !check.isFavored &&
      !check.result?.d6s?.length
    )
  }

  /** Whether any luck/study option remains for a failed check. */
  static canRescue(actor: any, focusId: string): boolean {
    if (!FocusUpkeep.pendingChecks.has(focusId)) return false
    const { luck = 0, studied = 0 } = actor.system.statuses.counters
    const canReroll = luck > 0 && !FocusUpkeep.rerolled.has(focusId)
    const canFavor =
      FocusUpkeep.canLateFavor(actor, focusId) && (luck > 0 || studied > 0)
    return canReroll || canFavor
  }

  /** Spends a Luck to reroll the d20 of a failed check. */
  static async reroll(
    actor: any,
    focusId: string,
    round: number,
  ): Promise<UpkeepResult> {
    const check = FocusUpkeep.pendingChecks.get(focusId)
    if (!check || FocusUpkeep.rerolled.has(focusId)) return "missing"
    if (!(await FocusUpkeep.spend(actor, "luck"))) return "missing"
    FocusUpkeep.rerolled.add(focusId)
    await check.roll(true)
    return FocusUpkeep.afterRescue(actor, focusId, check, round)
  }

  /** Spends Luck or a Studied die to add a Favor d6 to a failed check (requires the late luck/study option). */
  static async addFavor(
    actor: any,
    focusId: string,
    round: number,
    resource: "luck" | "studied",
  ): Promise<UpkeepResult> {
    const check = FocusUpkeep.pendingChecks.get(focusId)
    if (!check?.result || check.isFavored || check.result.d6s?.length)
      return "missing"
    if (!getAllowLateLuckStudy()) return "missing"
    if (!(await FocusUpkeep.spend(actor, resource))) return "missing"

    const d6 = await new Roll("1d6").evaluate()
    const result = { ...check.result }
    result.d6s = [d6.total]
    result.total += d6.total
    result.rolls = [...result.rolls, d6]
    result.favorHinder = appLang.FavorHinder.favor
    if (result.total >= result.difficulty) {
      result.outcome = appLang.RollResult.success
      result.success = true
    }
    check.result = result
    check.favorHinder = "favor"
    roll3dDice([d6])
    return FocusUpkeep.afterRescue(actor, focusId, check, round)
  }

  /** Max damage dice the caster can afford to repeat (1 mana per die). */
  static maxDice(actor: any): number {
    return maxRepeatDice(actor)
  }

  /** Deals a Focused spell's damage again at 1 mana per die, with no skill check and no new Focus. Resolves to the damage rolled, or undefined if nothing was sent. */
  static dealDamage(
    actor: any,
    instance: FocusInstance,
    dice: number,
    targetIds: string[],
  ): Promise<number | undefined> {
    return dealRepeatDamage(actor, instance, dice, targetIds)
  }

}
