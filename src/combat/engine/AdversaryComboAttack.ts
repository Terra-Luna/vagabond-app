import { canInitiateAttack, getTargetActor } from "../../util/model-util"
import type { SavingThrowType } from "./AdversaryAttack"
import { AppliedFx, Attack } from "./Attack"
import { DamageRoll } from "./roll/DamageRoll"
import { DiceRoll } from "./roll/DiceRoll"
import type { SkillCheckResult } from "./roll/SkillCheck"
import { applyAdversaryDamageMods } from "./util/adversary-damage-mods"
import type {
  AttackSnapshot,
  ComboSubAttackSnapshot,
} from "./util/attack-serializer"
import { serializeAttack } from "./util/attack-serializer"
import {
  AttackResolutionArgs,
  buildSummaryRow,
  computeDamageBreakdown,
  isImmuneToDamage,
  isWeakToDamage,
  TargetDamageSummary,
} from "./util/damage-mitigation"
import {
  isDamagedAfterSave,
  isHalvedBySave,
  overrideTargetSave,
  recordTargetSave,
  rerollTargetSave,
  rollTargetSave,
} from "./util/save-state"

export interface ComboSubAttackArgs {
  name: string
  dmgType: string
  isSpellAttack?: boolean
  dice: DiceRoll[]
  saveTypes?: SavingThrowType[]
  halfDamageOnSave?: boolean
  appliedEffects?: AppliedFx[]
}

/**
 * One repetition of an action within an Adversary combo (e.g. one of "2x Claw").
 */
export class ComboSubAttack {

  name: string
  damageRoll: DamageRoll
  isSpellAttack: boolean = false
  saveTypes: SavingThrowType[] = []
  halfDamageOnSave: boolean = false
  appliedEffects: AppliedFx[] = []
  saveResults: Record<string, SkillCheckResult> = {}
  defenseArmorBonuses: Record<string, number> = {}
  rerolledSaveTargetIds: string[] = []

  constructor(args: ComboSubAttackArgs) {
    this.name = args.name
    this.saveTypes = args.saveTypes ?? []
    this.halfDamageOnSave = args.halfDamageOnSave ?? false
    this.appliedEffects = (args.appliedEffects ?? []).map((eff) => ({
      ...eff,
      damageType: eff.damageType ?? args.dmgType,
    }))
    this.isSpellAttack = args.isSpellAttack ?? false
    this.damageRoll = DamageRoll.forAdversary({
      atkName: args.name,
      dmgType: args.dmgType,
      dice: args.dice,
    })
  }

  get showDamage(): boolean {
    return (this.damageRoll.result?.total ?? 0) > 0
  }

  async rollDamage(actor: Actor, targetIds: string[] = []) {
    if (this.damageRoll.dice.length > 0 && !this.damageRoll.result) {
      const { alwaysWeak } = applyAdversaryDamageMods(
        actor,
        this.damageRoll,
        this.isSpellAttack,
      )
      await this.damageRoll.roll(
        false,
        alwaysWeak ||
          targetIds.some((id) => isWeakToDamage(id, this.damageRoll)),
      )
      const rolled = this.damageRoll as DamageRoll
      if (rolled.result) rolled.result.total += rolled.flatDmgBonus
    }
  }

  shouldApplyDamageToTarget(targetId: string): boolean {
    return (
      !isImmuneToDamage(targetId, this.damageRoll, this.isSpellAttack) &&
      isDamagedAfterSave(this, targetId)
    )
  }

  isHalfDamageForTarget(targetId: string): boolean {
    return isHalvedBySave(this, targetId)
  }

  calculateAdjustedDamage(
    targetId: string,
    args: AttackResolutionArgs,
  ): number {
    return computeDamageBreakdown(
      this.damageRoll,
      targetId,
      args,
      this.defenseArmorBonuses[targetId] ?? 0,
      this.isHalfDamageForTarget(targetId),
    ).mitigated
  }

  rollSave(
    targetId: string,
    saveType: SavingThrowType,
    clickEvent?: React.MouseEvent,
  ): Promise<SkillCheckResult | undefined> {
    return rollTargetSave(this, targetId, saveType, clickEvent)
  }

  recordSaveResult(
    targetId: string,
    saveType: SavingThrowType,
    result: SkillCheckResult,
    armorBonus?: number,
  ): boolean {
    return recordTargetSave(this, targetId, saveType, result, armorBonus)
  }

  setSaveOutcome(targetId: string, outcome: string) {
    overrideTargetSave(this, targetId, outcome)
  }

  rerollSave(targetId: string): Promise<SkillCheckResult | undefined> {
    return rerollTargetSave(this, targetId)
  }

  toJson(): ComboSubAttackSnapshot {
    const rawDmg = this.damageRoll.toJson()
    return {
      name: this.name,
      saveTypes: this.saveTypes,
      halfDamageOnSave: this.halfDamageOnSave,
      isSpellAttack: this.isSpellAttack,
      appliedEffects: this.appliedEffects,
      damageRoll: {
        ...rawDmg,
        result: rawDmg.result
          ? {
              ...rawDmg.result,
              rolls:
                rawDmg.result.rolls?.map((r: any) =>
                  r && typeof r.toJSON === "function" ? r.toJSON() : r,
                ) ?? [],
            }
          : undefined,
      },
      saveResults: Object.fromEntries(
        Object.entries(this.saveResults ?? {}).map(([targetId, result]) => [
          targetId,
          {
            ...result,
            rolls:
              result.rolls?.map((r: any) =>
                r && typeof r.toJSON === "function" ? r.toJSON() : r,
              ) ?? [],
          },
        ]),
      ),
      defenseArmorBonuses: this.defenseArmorBonuses,
      rerolledSaveTargetIds: this.rerolledSaveTargetIds,
    }
  }

  static fromJson(snapshot: ComboSubAttackSnapshot): ComboSubAttack {
    const damageRoll = DamageRoll.fromJson(
      snapshot.damageRoll
        ? foundry.utils.deepClone(snapshot.damageRoll)
        : undefined,
    )
    const sub = new ComboSubAttack({
      name: snapshot.name,
      dmgType: damageRoll?.dmgType ?? "physical",
      dice: damageRoll?.dice ?? [],
      saveTypes: snapshot.saveTypes,
      halfDamageOnSave: snapshot.halfDamageOnSave,
      isSpellAttack: snapshot.isSpellAttack,
      appliedEffects: snapshot.appliedEffects,
    })
    sub.damageRoll = damageRoll ?? sub.damageRoll
    sub.saveResults = snapshot.saveResults
      ? foundry.utils.deepClone(snapshot.saveResults)
      : {}
    sub.defenseArmorBonuses = snapshot.defenseArmorBonuses
      ? { ...snapshot.defenseArmorBonuses }
      : {}
    sub.rerolledSaveTargetIds = snapshot.rerolledSaveTargetIds
      ? [...snapshot.rerolledSaveTargetIds]
      : []
    return sub
  }

}

export interface AdversaryComboAttackArgs {
  comboName: string
  subAttacks: ComboSubAttackArgs[]
}

export class AdversaryComboAttack extends Attack {

  override readonly attackType = "combo" as const

  protected override get prefixCountdownWithTargetName(): boolean {
    return true
  }

  subAttacks: ComboSubAttack[] = []

  constructor(
    actor: Actor,
    args: AdversaryComboAttackArgs,
    targetIds?: string[],
  ) {
    super(args.comboName, actor, targetIds)
    this.subAttacks = args.subAttacks.map((sub) => new ComboSubAttack(sub))
  }

  // The base getter only knows about a single damageRoll; a combo has one per sub-attack.
  override get showDamage(): boolean {
    return this.subAttacks.some((sub) => sub.showDamage)
  }

  async initiate() {
    if (!canInitiateAttack(this.actor)) return
    this.id = foundry.utils.randomID()
    for (const sub of this.subAttacks) {
      await sub.rollDamage(this.actor, this.targetIds)
    }
    await this.save(serializeAttack)
    await this.postChatCard(
      this.subAttacks.flatMap((sub) => sub.damageRoll.result?.rolls ?? []),
    )
  }

  async rollSave(
    subIndex: number,
    targetId: string,
    saveType: SavingThrowType,
    clickEvent?: React.MouseEvent,
  ): Promise<SkillCheckResult | undefined> {
    const sub = this.subAttacks[subIndex]
    if (!sub) return

    const result = await sub.rollSave(targetId, saveType, clickEvent)
    if (result) await this.saveOrAutoResolve(serializeAttack)
    return result
  }

  async rerollSave(
    subIndex: number,
    targetId: string,
  ): Promise<SkillCheckResult | undefined> {
    const sub = this.subAttacks[subIndex]
    if (!sub) return

    const result = await sub.rerollSave(targetId)
    if (result) await this.saveOrAutoResolve(serializeAttack)
    return result
  }

  // Every target has saved against every sub-attack and takes no damage from any of them.
  protected override get isNegatedForAllTargets(): boolean {
    return (
      this.targetIds.length > 0 &&
      this.subAttacks.every((sub) =>
        this.targetIds.every(
          (id) => !!sub.saveResults[id] && !sub.shouldApplyDamageToTarget(id),
        ),
      )
    )
  }

  async recordSaveResult(
    targetId: string,
    saveType: SavingThrowType,
    result: SkillCheckResult,
    armorBonus?: number,
  ): Promise<boolean> {
    if (this.isResolved || !this.targetIds.includes(targetId)) return false
    const recorded = this.subAttacks.map((sub) =>
      sub.recordSaveResult(targetId, saveType, result, armorBonus),
    )
    if (!recorded.some(Boolean)) return false
    await this.saveOrAutoResolve(serializeAttack)
    return true
  }

  async setSaveOutcome(
    subIndex: number,
    targetId: string,
    outcome: string,
  ): Promise<void> {
    const sub = this.subAttacks[subIndex]
    if (!sub) return

    sub.setSaveOutcome(targetId, outcome)
    await this.saveOrAutoResolve(serializeAttack)
  }

  static build(
    actor: Actor,
    args: AdversaryComboAttackArgs,
    targetIds?: string[],
  ): AdversaryComboAttack {
    return new AdversaryComboAttack(actor, args, targetIds)
  }

  protected override async processDamageRoll(args: AttackResolutionArgs) {
    const rows = this.getDamageSummary(args)
    for (const [index, sub] of this.subAttacks.entries()) {
      await this.processSubAttackDamage(
        sub,
        index,
        rows.filter((row) => row.subIndex === index),
        args,
      )
    }
  }

  private async processSubAttackDamage(
    sub: ComboSubAttack,
    subIndex: number,
    rows: TargetDamageSummary[],
    args: AttackResolutionArgs,
  ) {
    if (!sub.damageRoll.result || sub.damageRoll.dmgType === "none") {
      const failedIds = this.resolveTargetIds(args).filter(
        (id) =>
          sub.shouldApplyDamageToTarget(id) && !sub.isHalfDamageForTarget(id),
      )
      await this.applyFxToTargets(sub.appliedEffects, failedIds)
      return
    }

    for (const row of rows) {
      const actor = getTargetActor(row.targetId)
      const hp = this.getHP(actor?.system)
      await this.updateHP(actor?.system, hp - row.total)
    }

    await this.applyStatusEffectsForSub(
      sub,
      args,
      rows.filter((row) => row.total >= 1).map((row) => row.targetId),
    )
  }

  private async applyStatusEffectsForSub(
    sub: ComboSubAttack,
    args: AttackResolutionArgs,
    eligibleTargetIds: string[],
  ) {
    if (sub.appliedEffects.length === 0) return

    // Skip targets who passed the save (half damage only) or wouldn't have taken any damage (e.g. fully mitigated).
    const damagedIds = eligibleTargetIds.filter(
      (id) =>
        !sub.isHalfDamageForTarget(id) &&
        sub.calculateAdjustedDamage(id, args) >= 1,
    )
    const allyIds = this.resolveTargetIds(args).filter((id) =>
      this.isAdversaryAlly(id),
    )
    await this.applyFxToTargets(sub.appliedEffects, [
      ...new Set([...damagedIds, ...allyIds]),
    ])
  }

  override getDamageSummary(args: AttackResolutionArgs): TargetDamageSummary[] {
    return this.subAttacks.flatMap((sub, subIndex) => {
      if (!sub.damageRoll.result) return []
      const targetIds = this.resolveTargetIds(args).filter((id) =>
        sub.shouldApplyDamageToTarget(id),
      )
      return targetIds.map((id) => {
        const breakdown = computeDamageBreakdown(
          sub.damageRoll,
          id,
          args,
          sub.defenseArmorBonuses[id] ?? 0,
          sub.isHalfDamageForTarget(id),
        )
        return buildSummaryRow(
          id,
          subIndex,
          breakdown,
          0,
          args,
          sub.damageRoll.dmgType,
          sub.name,
        )
      })
    })
  }

  // Toggles on each sub-attack's configured statuses for failed targets without applying damage, then resolves.
  async applyStatusesAndResolve(
    args: AttackResolutionArgs,
    serialize: (attack: Attack) => AttackSnapshot | undefined,
  ) {
    if (this.isResolved) return

    for (const sub of this.subAttacks) {
      if (!sub.damageRoll.result) continue
      const targetIds = this.resolveTargetIds(args).filter((id) =>
        sub.shouldApplyDamageToTarget(id),
      )
      await this.applyStatusEffectsForSub(sub, args, targetIds)
    }

    await this.resolve(serialize)
  }

}
