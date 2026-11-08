import { CountdownManager } from "../../apps/vagabond-tools/usecase/CountdownManager"
import { getAttackRegistry, setAttackRegistry } from "../../apps/vagabond-tools/usecase/VagabondSettingsHelper"
import { ActorDataModel, BaseActorSchema } from "../../model/actor/ActorDataModel"
import { FocusSpellUtil } from "../../model/actor/util/FocusSpellUtil"
import { StatusEffectUtil } from "../../model/actor/util/StatusEffectUtil"
import { roll3dDice, sys_id } from "../../util/foundry-util"
import { appLang } from "../../util/lang"
import { LightSourceUtil } from "../../util/LightSourceUtil"
import { getCanvasToken, getTargetActor, getTargetIds } from "../../util/model-util"
import { sendVagabondChatCard } from "../../view/chat/ChatCardSerializer"
import { DamageRoll } from "./roll/DamageRoll"
import { applyActiveEffectCopy, isActiveEffectFx, isLightFx, parseLightFx } from "./util/active-effect-fx"
import type { AttackSnapshot } from "./util/attack-serializer"
import { isImmuneToBurning } from "./util/burning-mitigation"
import { absorbsDamage, AttackResolutionArgs, buildSummaryRow, calculateBonusDamage, computeDamageBreakdown, DamageBreakdown, ExtraDamage, isImmuneToDamage, isImmuneToStatus, isWeakToDamage, TargetDamageSummary } from "./util/damage-mitigation"
import { HuntersMark } from "./util/HuntersMark"

export type {
  AttackResolutionArgs,
  DamageBreakdown,
  ExtraDamage,
  TargetDamageSummary,
} from "./util/damage-mitigation"
export { damageOverrideKey } from "./util/damage-mitigation"

const FOCUS_DAMAGE_LIMIT = 5

export interface AppliedFx {
  effect: string
  duration?: string
  critDuration?: string
  damageType?: string
}

/**
 * Spell damage that a Hero imbued into another attack. Several Heroes can imbue the same attack.
 */
export interface ImbueEntry {
  actorId: string
  spellName: string
  spellUuid: string
  applyEffect?: boolean
  damageRoll: DamageRoll
  targetIds?: string[]
  appliedEffects: AppliedFx[]
}

export abstract class Attack<TActor extends Actor = Actor> {

  abstract readonly attackType: "adversary" | "hero" | "combo"

  // Unique ID for interacting with the attack in chat card
  id: string
  // User ID for keeping track of who has permission to interact in chat card
  userId: string = game.userId ?? ""
  // Used to find the most recent attack targeting a given token
  createdAt: number = Date.now()
  // Actor whose token is shown on the chat card when it differs from the rolling actor (e.g. a follower).
  portraitActorId?: string

  actor: TActor
  targetIds: string[]
  title: string = "Attack"
  damageRoll?: DamageRoll
  get isSpellAttack(): boolean {
    return false
  }
  get isEffectOnlySpellAttack(): boolean {
    return false
  }
  // Weapon attacks can have a Hero's spell imbued into them.
  get isImbuable(): boolean {
    return false
  }
  imbues: ImbueEntry[] = []
  isResolved: boolean = false
  appliedEffects: AppliedFx[] = []

  constructor(
    title: string,
    actor: TActor,
    targetIds?: string[],
    damageRoll?: DamageRoll,
  ) {
    this.id = foundry.utils.randomID()
    this.title = title
    this.actor = actor
    this.targetIds = targetIds ?? []
    this.damageRoll = damageRoll
  }

  get showTargets(): boolean {
    return (this.targetIds?.length ?? 0) > 0
  }

  get showDamage(): boolean {
    return (this.damageRoll?.result?.total ?? 0) > 0
  }

  async rollDamage(isCrit?: boolean) {
    if (await Attack.rollDamageOnce(this.damageRoll, isCrit, this.targetIds)) {
      roll3dDice(this.damageRoll?.result?.rolls ?? [])
    }
  }

  /**
   * Rolls the damage once (adding the weakness die if any target is weak). Returns whether a roll happened.
   */
  protected static async rollDamageOnce(
    damageRoll: DamageRoll | undefined,
    isCrit: boolean | undefined,
    targetIds: string[],
    alwaysWeak = false,
  ): Promise<boolean> {
    if (!damageRoll || damageRoll.dice.length === 0 || damageRoll.result)
      return false
    await damageRoll.roll(
      isCrit,
      alwaysWeak || Attack.hasWeakTarget(targetIds, damageRoll),
    )
    return true
  }

  protected static hasWeakTarget(
    targetIds: string[],
    damageRoll?: DamageRoll,
  ): boolean {
    return targetIds.some((id) => isWeakToDamage(id, damageRoll))
  }

  protected resolveTargetIds(args: AttackResolutionArgs): string[] {
    return args.gmTargetsOnly ? getTargetIds() : (this.targetIds ?? [])
  }

  protected async postChatCard(rolls?: Roll[]) {
    await sendVagabondChatCard(
      this.actor,
      "InteractiveAttackChatCard",
      { actorId: this.actor.id!, attackId: this.id },
      rolls,
    )
  }

  async applyDamageAndResolve(
    args: AttackResolutionArgs,
    serialize: (attack: Attack) => AttackSnapshot | undefined,
  ) {
    if (this.isResolved) return
    await this.processDamageRoll(args)
    await this.processStatusFx(args)
    await this.resolve(serialize)
  }

  async removeTarget(
    targetId: string,
    serialize: (attack: Attack) => AttackSnapshot | undefined,
  ) {
    this.targetIds = this.targetIds.filter((id) => id !== targetId)
    this.imbues.forEach((imbue) => {
      if (imbue.targetIds)
        imbue.targetIds = imbue.targetIds.filter((id) => id !== targetId)
    })
    await this.save(serialize)
  }

  async resolve(serialize: (attack: Attack) => AttackSnapshot | undefined) {
    this.isResolved = true
    await this.save(serialize)
  }

  /** Resolves without applying anything: the result of a 'Resolve' button, as opposed to 'Apply'. */
  async resolveWithoutUpdates(
    serialize: (attack: Attack) => AttackSnapshot | undefined,
  ) {
    await this.resolve(serialize)
  }

  protected get isNegatedForAllTargets(): boolean {
    return false
  }

  /**
   * Persists the attack, resolving it first if nothing is left to apply.
   */
  protected async saveOrAutoResolve(
    serialize: (attack: Attack) => AttackSnapshot | undefined,
  ) {
    if (!this.isResolved && this.isNegatedForAllTargets) {
      await this.resolve(serialize)
    }
    else {
      await this.save(serialize)
    }
  }

  protected processDamageRoll(
    args: AttackResolutionArgs,
  ): void | Promise<void> {
    if (this.damageRoll?.result) {
      if (this.damageRoll.dmgType === "healing") {
        this.applyHealing(args)
      }
      else if (this.damageRoll.dmgType === "mana") {
        this.applyMana(args)
      }
      else if (this.damageRoll.dmgType === "fatigue") {
        this.applyFatigueDamage(args)
      }
      else {
        return this.applyDamage(args)
      }
    }
  }

  private applyHealing(args: AttackResolutionArgs) {
    for (const row of this.getHealingSummary(args)) {
      const target = getTargetActor(row.targetId)
      if (!target) continue
      this.updateHP(target.system, this.getHP(target.system) + row.total)
    }
  }

  private getHealingSummary(
    args: AttackResolutionArgs,
    onlyTargetIds?: string[],
  ): TargetDamageSummary[] {
    const targetIds = onlyTargetIds ?? this.resolveTargetIds(args)
    const rolled = this.damageRoll?.result?.total ?? 0
    const diceCount = this.damageRoll?.result?.rollSummaries?.length ?? 0
    const rows: TargetDamageSummary[] = []
    for (const id of targetIds) {
      const target = getTargetActor(id)
      if (!target) continue
      const mods =
        (target.system as any)?.modifiers?.healing?.in?.modifier ?? {}
      const flat = Number(mods?.flat ?? 0)
      const perDieMod = Number(mods?.perDie ?? 0)
      // A negative per-die modifier can reduce each die to 0 at most.
      const perDie = (this.damageRoll?.result?.rollSummaries ?? [])
        .filter((it) => !it.rerolled)
        .reduce((acc, it) => {
          const value = it.result + (this.damageRoll?.perDieDmgBonus ?? 0)
          return acc + Math.max(0, value + perDieMod) - value
        }, 0)
      const setValue = Number(mods?.perDieOverride ?? 0) * diceCount
      const calculated = Math.max(
        0,
        (setValue > 0 ? setValue : rolled + perDie) + flat,
      )
      const row = buildSummaryRow(
        id,
        0,
        {
          damageBeforeHalving: rolled,
          damage: rolled,
          imbueDamage: 0,
          imbueParts: [],
          resistanceDivisor: 1,
          armor: 0,
          armorPiercing: 0,
          otherMitigation: 0,
          mitigatedBeforeSave: calculated,
          saveHalved: false,
          mitigated: calculated,
        },
        0,
        args,
        "healing",
        undefined,
      )
      rows.push({
        ...row,
        healing: { flat, perDie, setValue },
        ...(onlyTargetIds ? { absorbed: true } : {}),
      })
    }
    return rows
  }

  private applyMana(args: AttackResolutionArgs) {
    this.getActors(this.resolveTargetIds(args)).forEach((target) => {
      this.updateMana(
        target?.system,
        this.getMana(target?.system) + this.damageRoll?.result?.total,
      )
    })
  }

  private applyFatigueDamage(args: AttackResolutionArgs) {
    const targetIds = this.resolveTargetIds(args).filter((id) =>
      this.shouldApplyDamageToTarget(id),
    )
    targetIds.forEach((id) => {
      const actor = getTargetActor(id)
      const damage = this.damageRoll?.result?.total
      if (!damage || !actor) return
      actor.update({
        "system.statuses.counters.fatigue":
          (actor.system as any).statuses.counters.fatigue + damage,
      } as Record<string, number>)
    })
  }

  /** Damage of FOCUS_DAMAGE_LIMIT or more from one attack breaks the target's Focus. */
  protected async breakFocusIfHit(targetActor: any, damage: number) {
    if (!targetActor || damage < FOCUS_DAMAGE_LIMIT) return
    const isHero = targetActor.type === "hero"
    const isFocusing =
      (targetActor.system as ActorDataModel<BaseActorSchema>).statuses.toggles
        .focusing ||
      (isHero && FocusSpellUtil.instances(targetActor).length > 0)
    if (!isFocusing) return

    if (isHero) {
      await FocusSpellUtil.breakAll(targetActor)
      return
    }
    await targetActor.update({
      "system.statuses.counters.focus": 0,
    } as Record<string, number>)
    await StatusEffectUtil.toggleStatusEffectOnce(
      targetActor,
      "focusing",
      false,
    )
  }

  // Applies the HP change shown in the damage summary (including any GM overrides).
  private async applyDamage(args: AttackResolutionArgs) {
    // Sum rows per target so multiple damage sources (e.g. Imbues) are applied in one HP update.
    const totals = new Map<string, number>()
    for (const row of this.getDamageSummary({
      ...args,
      isSpellAttack: this.isSpellAttack,
    })) {
      if (row.failed) continue
      if (row.dmgType === "healing") {
        const absorber = getTargetActor(row.targetId)
        if (absorber)
          this.updateHP(
            absorber.system,
            this.getHP(absorber.system) + row.total,
          )
        continue
      }
      totals.set(row.targetId, (totals.get(row.targetId) ?? 0) + row.total)
    }

    for (const [targetId, adjDamage] of totals) {
      const targetActor = getTargetActor(targetId) as any
      if (!targetActor) continue

      const weaknesses =
        targetActor?.system?.modifiers?.damage?.in?.weaknesses ?? []
      const deathRequirements =
        targetActor?.system?.modifiers?.damage?.in?.deathRequirements

      await this.breakFocusIfHit(targetActor, adjDamage)

      const hp = this.getHP(targetActor?.system)
      const newHp = hp - adjDamage

      const canDie =
        newHp < 1 &&
        this.checkDeathRequirements(deathRequirements, weaknesses, targetActor)

      this.updateHP(
        targetActor?.system,
        canDie || newHp >= 1 ? newHp : Math.min(hp, 1),
      )
    }
  }

  /**
   * Extra damage from the attacker's being-type modifiers and hit-dice multiplier.
   */
  protected calculateBonusDamage(
    targetActor: any,
    sourceActor: any = this.getModifierSourceActor(),
    damageRoll: DamageRoll | undefined = this.damageRoll,
  ): number {
    return (
      calculateBonusDamage(targetActor, sourceActor, damageRoll) +
      HuntersMark.getLethalPrecisionBonus(targetActor)
    )
  }

  /**
   * Follower attacks are rolled by the Hero but use only the follower NPC's own modifiers.
   * Prefers the canvas token's actor, since unlinked tokens carry their own effects.
   */
  protected getModifierSourceActor(): any {
    if (!this.portraitActorId) return this.actor
    const tokenActor = canvas?.tokens?.placeables?.find(
      (t) => t.actor?.id === this.portraitActorId,
    )?.actor
    return tokenActor ?? game.actors?.get(this.portraitActorId) ?? this.actor
  }

  /**
   * Per-target preview of what "Apply" will do for standard damage. Mirrors applyDamage.
   */
  getDamageSummary(args: AttackResolutionArgs): TargetDamageSummary[] {
    const failedRows = this.resolveTargetIds(args)
      .filter((id) => this.isMissedTarget(id))
      .map((id) => this.buildFailedRow(id, args))
    return [...failedRows, ...this.getHitDamageSummary(args)]
  }

  /**
   * Whether the attacker's check failed against this specific target (e.g. due to a defense penalty).
   * Override in attacks that roll a check.
   */
  protected isMissedTarget(_targetId: string): boolean {
    return false
  }

  private buildFailedRow(
    targetId: string,
    args: AttackResolutionArgs,
  ): TargetDamageSummary {
    return {
      ...buildSummaryRow(
        targetId,
        0,
        {
          damageBeforeHalving: 0,
          damage: 0,
          imbueDamage: 0,
          imbueParts: [],
          resistanceDivisor: 1,
          armor: 0,
          armorPiercing: 0,
          otherMitigation: 0,
          mitigatedBeforeSave: 0,
          saveHalved: false,
          mitigated: 0,
        },
        0,
        args,
        this.damageRoll?.dmgType ?? "",
        undefined,
      ),
      failed: true,
    }
  }

  private getHitDamageSummary(
    args: AttackResolutionArgs,
  ): TargetDamageSummary[] {
    const dmgType = this.damageRoll?.dmgType
    if (this.damageRoll?.result && dmgType === "healing")
      return this.getHealingSummary(args)
    if (!this.damageRoll?.result || dmgType === "mana" || dmgType === "fatigue")
      return []

    const summaries: TargetDamageSummary[] = []
    // Targets that absorb this damage type are healed by it instead of damaged.
    const absorbingIds = this.resolveTargetIds(args).filter(
      (id) => !this.isMissedTarget(id) && absorbsDamage(id, this.damageRoll),
    )
    if (absorbingIds.length)
      summaries.push(...this.getHealingSummary(args, absorbingIds))
    const targetIds = this.resolveTargetIds(args).filter(
      (id) =>
        !this.isMissedTarget(id) &&
        !absorbingIds.includes(id) &&
        (this.shouldApplyDamageToTarget(id) || this.hasApplicableImbue(id)),
    )

    for (const id of targetIds) {
      const targetActor = getTargetActor(id)
      if (!targetActor) continue
      const breakdown = this.calculateDamageBreakdown(id, {
        ...args,
        isSpellAttack: this.isSpellAttack,
      })
      const bonus = this.shouldApplyDamageToTarget(id)
        ? this.calculateBonusDamage(targetActor)
        : 0
      summaries.push(
        buildSummaryRow(
          id,
          0,
          breakdown,
          bonus,
          args,
          this.damageRoll?.dmgType ?? "",
          undefined,
        ),
      )
    }
    return summaries
  }

  /**
   * Whether an imbued spell would still damage the target, even when the attack's own damage is blocked
   * (e.g. by a relic-level immunity that only applies to the weapon).
   */
  private hasApplicableImbue(targetId: string): boolean {
    return this.imbues.some(
      (imbue) =>
        (!imbue.targetIds || imbue.targetIds.includes(targetId)) &&
        !!imbue.damageRoll?.result &&
        !isImmuneToDamage(targetId, imbue.damageRoll, true),
    )
  }

  protected calculateDamageBreakdown(
    targetId: string,
    args: AttackResolutionArgs,
  ): DamageBreakdown {
    const targetActor = getTargetActor(targetId)
    const extras: ExtraDamage[] = this.imbues
      .filter((imbue) => !imbue.targetIds || imbue.targetIds.includes(targetId))
      .map((imbue) => ({
        damageRoll: imbue.damageRoll,
        label: imbue.spellName,
        bonus: this.calculateBonusDamage(
          targetActor,
          game.actors?.get(imbue.actorId) ?? this.actor,
          imbue.damageRoll,
        ),
      }))
    return computeDamageBreakdown(
      this.shouldApplyDamageToTarget(targetId) ? this.damageRoll : undefined,
      targetId,
      args,
      this.getAdditionalArmorRating(targetId),
      this.isHalfDamageForTarget(targetId),
      extras,
    )
  }

  protected shouldApplyDamageToTarget(targetId: string): boolean {
    return (
      !this.isMissedTarget(targetId) &&
      !absorbsDamage(targetId, this.damageRoll) &&
      !isImmuneToDamage(targetId, this.damageRoll, this.isSpellAttack)
    )
  }

  /**
   * Override as needed to implement custom death requirement checks for different attack types.
   */
  protected checkDeathRequirements(
    deathRequirements: any,
    weaknesses: any[],
    targetActor?: any,
  ): boolean {
    return true
  }

  /**
   * Whether any target is weak to this attack (i.e. the weakness die should be rolled).
   */
  protected get hasWeakTarget(): boolean {
    return Attack.hasWeakTarget(this.targetIds ?? [], this.damageRoll)
  }

  protected calculateAdjustedDamage(
    targetId: string,
    args: AttackResolutionArgs,
  ): number {
    args.isSpellAttack = this.isSpellAttack
    return computeDamageBreakdown(
      this.damageRoll,
      targetId,
      args,
      this.getAdditionalArmorRating(targetId),
      this.isHalfDamageForTarget(targetId),
    ).mitigated
  }

  protected isHalfDamageForTarget(_targetId: string): boolean {
    return false
  }

  /**
   * Base function - overridden by AdversaryAttack. Not used for Hero attacks.
   */
  protected getAdditionalArmorRating(_targetId: string): number {
    return 0
  }

  protected get isCriticalHit(): boolean {
    return false
  }

  // Adversaries targeting other adversaries always apply their effects (e.g. Exalted, Blessed), regardless of damage or saves.
  protected isAdversaryAlly(targetId: string): boolean {
    return (
      (this.actor as any)?.type === "adversary" &&
      (getTargetActor(targetId) as any)?.type === "adversary"
    )
  }

  protected shouldApplyEffectsToTarget(
    targetId: string,
    _args: AttackResolutionArgs,
  ): boolean {
    return this.shouldApplyDamageToTarget(targetId)
  }

  protected async processStatusFx(args: AttackResolutionArgs) {
    if (this.appliedEffects.length > 0) {
      const targetIds = this.resolveTargetIds(args).filter(
        (id) =>
          this.isAdversaryAlly(id) || this.shouldApplyEffectsToTarget(id, args),
      )
      await this.applyFxToTargets(this.appliedEffects, targetIds)
    }

    for (const imbue of this.imbues) {
      if (imbue.appliedEffects.length === 0) continue
      const targetIds = this.resolveTargetIds(args)
        .filter((id) => !imbue.targetIds || imbue.targetIds.includes(id))
        .filter((id) => !isImmuneToDamage(id, imbue.damageRoll, true))
      await this.applyFxToTargets(imbue.appliedEffects, targetIds)
    }
  }

  protected async applyFxToTargets(effects: AppliedFx[], targetIds: string[]) {
    for (const id of targetIds) {
      const token = getCanvasToken(id)
      const actor = token?.actor ?? getTargetActor(id)
      if (!actor) continue

      for (const eff of effects) {
        const duration =
          this.isCriticalHit && eff.critDuration
            ? eff.critDuration
            : eff.duration

        if (isLightFx(eff.effect)) {
          await this.recordFocusFx(actor, eff.effect, duration)
          await this.applyLight(actor, token, eff.effect, duration)
          continue
        }

        if (isActiveEffectFx(eff.effect)) {
          await this.recordFocusFx(actor, eff.effect, duration)
          await this.applyActiveEffect(actor, token, eff.effect, duration)
          continue
        }

        if (isImmuneToStatus(actor, eff.effect)) continue
        if (
          eff.effect === "burning" &&
          isImmuneToBurning(actor, eff.damageType)
        )
          continue

        await this.recordFocusFx(actor, eff.effect, duration, eff.damageType)
        await this.applyEffects(
          actor,
          token,
          eff.effect,
          duration,
          eff.damageType,
          eff.effect === "burning" ? this.focusRef?.focusId : undefined,
        )
      }
    }
  }

  /** The Focus (and its spell) maintaining this attack's effects, if any. */
  protected get focusRef(): { spell: string; focusId: string } | undefined {
    return undefined
  }

  private async recordFocusFx(
    actor: Actor,
    effect: string,
    duration?: string,
    damageType?: string,
  ) {
    const ref = this.focusRef
    const isContinual = duration?.toLowerCase() === "continual"
    // Burning is always tied to the Focus, even with a countdown, so dropping Focus can extinguish it.
    const isTied =
      !isContinual &&
      (duration?.toLowerCase() === "focus" || effect === "burning")
    if (!StatusEffectUtil.isDesignatedUser()) return
    try {
      if (isContinual) {
        // Continual (e.g. a crit's duration) outlasts the Focus, the area, and the end of the round.
        await FocusSpellUtil.makePermanent(this.actor, {
          spell: ref?.spell ?? this.roundExpirySpell ?? "",
          targetUuid: actor.uuid,
          effect,
          ...(damageType && { damageType }),
        })
      }
      else if (ref && isTied) {
        await FocusSpellUtil.record(this.actor, {
          ...ref,
          targetUuid: actor.uuid,
          effect,
          ...(damageType && { damageType }),
        })
      }
      else if (this.roundExpirySpell) {
        await FocusSpellUtil.expireNextRound(this.actor, {
          spell: this.roundExpirySpell,
          targetUuid: actor.uuid,
          effect,
          ...(damageType && { damageType }),
        })
      }
    }
    catch (error) {
      console.error("Failed to record Focus effect", error)
    }
  }

  /** The spell whose effects wear off at the start of the next round unless Focused on or focus-exempt. */
  protected get roundExpirySpell(): string | undefined {
    return undefined
  }

  /** The icon a granted light shows on its token (the spell's, when a spell cast it). */
  protected get lightIcon(): string | undefined {
    return undefined
  }

  private async applyLight(
    actor: Actor,
    token: Token | undefined,
    id: string,
    duration?: string,
  ) {
    if (!duration || duration === "-") return

    await LightSourceUtil.grantLight(actor, {
      ...parseLightFx(id),
      focused: duration.toLowerCase() === "focus",
      ...(this.lightIcon && { img: this.lightIcon }),
    })

    const countdownFaces = duration.match(/^Cd(\d+)$/)?.[1]
    if (countdownFaces) {
      const name = appLang.Effects.emitsLight
      const label = this.prefixCountdownWithTargetName
        ? `${token?.name ?? actor.name}: ${name}`
        : name
      await CountdownManager.add(
        label,
        Number(countdownFaces),
        undefined,
        undefined,
        actor.uuid,
        token?.document?.uuid,
        { id, name },
      )
    }
  }

  private async applyActiveEffect(
    actor: Actor,
    token: Token | undefined,
    id: string,
    duration?: string,
  ) {
    if ((actor as any).type !== "hero") return
    if (!duration || duration === "-") return

    const name = await applyActiveEffectCopy(actor, id)
    if (!name) return

    const countdownFaces = duration.match(/^Cd(\d+)$/)?.[1]
    if (countdownFaces) {
      const label = this.prefixCountdownWithTargetName
        ? `${token?.name ?? actor.name}: ${name}`
        : name
      await CountdownManager.add(
        label,
        Number(countdownFaces),
        undefined,
        undefined,
        actor.uuid,
        token?.document?.uuid,
        { id, name },
      )
    }
  }

  protected get prefixCountdownWithTargetName(): boolean {
    return false
  }

  private async applyEffects(
    actor: Actor,
    token: Token | undefined,
    status: string,
    duration?: string,
    damageType?: string,
    focusId?: string,
  ) {
    if (!duration || duration === "-") return

    StatusEffectUtil.toggleStatusEffectOnce(actor, status, true)

    const countdownFaces = duration?.match(/^Cd(\d+)$/)?.[1]
    if (countdownFaces) {
      const statusName = appLang.StatusConditions[status]?.name ?? status
      const label = this.prefixCountdownWithTargetName
        ? `${token?.name ?? actor.name}: ${statusName}`
        : statusName
      await CountdownManager.add(
        label,
        Number(countdownFaces),
        undefined,
        undefined,
        actor.uuid,
        token?.document?.uuid,
        { id: status, damageType: damageType, focusId },
      )
    }
  }

  protected getActors(targetIds: string[]) {
    return targetIds.map((id) => getTargetActor(id))
  }

  protected getHP(target) {
    return target?.health?.value
  }

  protected getMana(target) {
    return target?.mana?.value
  }

  protected async updateHP(target, hp) {
    if (target) {
      await target?.parent?.update({ "system.health.value": hp })
    }
  }

  protected async updateMana(target, mp) {
    if (target) {
      await target?.parent?.update({ "system.mana.value": mp })
    }
  }

  async save(serialize: (attack: Attack) => AttackSnapshot | undefined) {
    const snapshot = serialize(this)
    if (!snapshot || !this.actor.id) return

    /**
     * IF USER IS GM: Write to the database directly
     */
    if (game.user?.isGM) {
      await Attack.handleIncomingAttackSnapshot({
        actorId: this.actor.id,
        snapshot,
      })
      return
    }
    /**
     * IF USER IS PLAYER: route the atk snapshot thru the socket
     * to the GM's client so it can be saved to world settings.
     */
    const payload = {
      action: "saveAttackSnapshot",
      data: {
        actorId: this.actor.id,
        snapshot: snapshot,
      },
    }
    game.socket?.emit(`system.${sys_id}`, payload)
  }

  static async handleIncomingAttackSnapshot(payload: {
    actorId: string
    snapshot: AttackSnapshot
  }) {
    const { actorId, snapshot } = payload
    const registryRaw = getAttackRegistry()
    const attackRegistry =
      typeof registryRaw === "string"
        ? JSON.parse(registryRaw)
        : registryRaw || {}

    if (!attackRegistry[actorId]) {
      attackRegistry[actorId] = []
    }

    const currentAttacks: AttackSnapshot[] = attackRegistry[actorId]
    const exists = currentAttacks.some((it) => it.id === snapshot.id)

    const updatedAttacks = exists
      ? currentAttacks.map((it) => (it.id === snapshot.id ? snapshot : it))
      : [...currentAttacks, snapshot]

    // Keep only the last 50 attacks for each actor.
    attackRegistry[actorId] = updatedAttacks.slice(-50)

    await setAttackRegistry(attackRegistry)
  }

}
