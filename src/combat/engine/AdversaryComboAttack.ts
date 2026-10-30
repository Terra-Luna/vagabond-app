import type { HeroDataModel } from "../../model/actor/HeroDataModel"
import { appLang } from "../../utils/lang"
import { getTargetIds } from "../../utils/modelUtil"
import { sendVagabondChatCard } from "../../view/chat/ChatCardSerializer"
import type { SavingThrowType } from "./AdversaryAttack"
import { AppliedFx, Attack, AttackResolutionArgs, TargetDamageSummary } from "./Attack"
import { HeroAttack } from "./HeroAttack"
import { DamageRoll } from "./roll/DamageRoll"
import { DiceRoll } from "./roll/DiceRoll"
import { buildManualSaveResult, SkillCheck, SkillCheckResult } from "./roll/SkillCheck"
import type { AttackSnapshot, ComboSubAttackSnapshot } from "./util/attack-serializer"
import { serializeAttack } from "./util/attack-serializer"

export interface ComboSubAttackArgs {
    name: string,
    dmgType: string,
    isSpellAttack?: boolean
    dice: DiceRoll[],
    saveTypes?: SavingThrowType[],
    halfDamageOnSave?: boolean,
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
        this.appliedEffects = (args.appliedEffects ?? []).map(eff => ({ ...eff, damageType: eff.damageType ?? args.dmgType }))
        this.isSpellAttack = args.isSpellAttack ?? false
        this.damageRoll = new DamageRoll({
            atkName: args.name,
            dmgType: args.dmgType,
            dice: args.dice
        })
    }

    get showDamage(): boolean {
        return (this.damageRoll.result?.total ?? 0) > 0
    }

    async rollDamage(isCrit?: boolean) {
        if (this.damageRoll.dice.length > 0 && !this.damageRoll.result) {
            await this.damageRoll.roll(isCrit)
        }
    }

    // Same rules as AdversaryAttack: a Block meeting/beating its difficulty negates all damage.
    shouldApplyDamageToTarget(targetId: string): boolean {
        if (Attack.isImmuneToDamage(targetId, this.damageRoll, this.isSpellAttack)) return false
        const result = this.saveResults[targetId]
        // A defense only adds armor; it doesn't negate the damage.
        if (this.defenseArmorBonuses[targetId] !== undefined) return true
        return !result || result.outcome === appLang.RollResult.failure
            || (result.outcome === appLang.RollResult.success && this.halfDamageOnSave)
    }

    isHalfDamageForTarget(targetId: string): boolean {
        return this.halfDamageOnSave
            && this.defenseArmorBonuses[targetId] === undefined
            && this.saveResults[targetId]?.outcome === appLang.RollResult.success
    }

    calculateAdjustedDamage(targetId: string, args: AttackResolutionArgs): number {
        return Attack.computeAdjustedDamage(this.damageRoll, targetId, args, this.defenseArmorBonuses[targetId] ?? 0, this.isHalfDamageForTarget(targetId))
    }

    async rollSave(targetId: string, saveType: SavingThrowType, clickEvent?: React.MouseEvent): Promise<SkillCheckResult | undefined> {
        // Defend is offered whenever a Reflex save is allowed.
        const isAllowed = saveType === 'defend' ? this.saveTypes.includes('reflex') : this.saveTypes.includes(saveType)
        if (!isAllowed || this.saveResults[targetId]) return

        const targetActor = canvas?.scene?.tokens?.get(targetId)?.actor
        if (!targetActor) return

        const hero = targetActor.system as HeroDataModel
        let result: SkillCheckResult
        if (saveType === 'defend') {
            const defense = await HeroAttack.rollDefense(hero, { clickEvent })
            if (!defense) return
            result = defense.result
            this.defenseArmorBonuses = { ...this.defenseArmorBonuses, [targetId]: defense.armorBonus }
        } else {
            result = await new SkillCheck(hero, { type: 'save', skill: saveType, clickEvent: clickEvent as any }).roll()
        }

        this.saveResults = { ...this.saveResults, [targetId]: result }

        return result
    }

    recordSaveResult(targetId: string, saveType: SavingThrowType, result: SkillCheckResult, armorBonus?: number): boolean {
        const isAllowed = saveType === 'defend' ? this.saveTypes.includes('reflex') : this.saveTypes.includes(saveType)
        if (!isAllowed) return false

        const existing = this.saveResults[targetId]
        if (existing) {
            if (existing.outcome !== appLang.RollResult.failure || this.rerolledSaveTargetIds.includes(targetId)) return false
            this.rerolledSaveTargetIds = [...this.rerolledSaveTargetIds, targetId]
            this.defenseArmorBonuses = Object.fromEntries(
                Object.entries(this.defenseArmorBonuses).filter(([id]) => id !== targetId)
            )
        }

        if (saveType === 'defend') this.defenseArmorBonuses = { ...this.defenseArmorBonuses, [targetId]: armorBonus ?? 0 }
        this.saveResults = { ...this.saveResults, [targetId]: result }
        return true
    }

    setSaveOutcome(targetId: string, outcome: string) {
        const skill = this.saveTypes.find(type => type !== 'defend') ?? 'reflex'
        this.saveResults = { ...this.saveResults, [targetId]: buildManualSaveResult(skill, outcome) }
        this.defenseArmorBonuses = Object.fromEntries(
            Object.entries(this.defenseArmorBonuses).filter(([id]) => id !== targetId)
        )
    }

    async rerollSave(targetId: string): Promise<SkillCheckResult | undefined> {
        const existing = this.saveResults[targetId]
        if (!existing || existing.outcome !== appLang.RollResult.failure || this.rerolledSaveTargetIds.includes(targetId)) return

        const targetActor = canvas?.scene?.tokens?.get(targetId)?.actor
        if (!targetActor) return

        const hero = targetActor.system as HeroDataModel
        const luck = hero.statuses?.counters?.luck ?? 0
        if (luck <= 0) return

        await targetActor.update(
            { 'system.statuses.counters.luck': luck - 1 } as Record<string, number>,
            { ['skipTrackerChatCard' as string]: true }
        )

        const favorHinder = existing.favorHinder as 'favor' | 'hinder' | 'none'

        let result: SkillCheckResult
        if (this.defenseArmorBonuses[targetId] !== undefined) {
            const defense = await HeroAttack.rollDefense(hero, { favorHinder })
            if (!defense) return
            result = defense.result
            this.defenseArmorBonuses = { ...this.defenseArmorBonuses, [targetId]: defense.armorBonus }
        } else {
            result = await new SkillCheck(hero, { type: 'save', skill: existing.skill, favorHinder }).roll()
        }
        this.saveResults = { ...this.saveResults, [targetId]: result }
        this.rerolledSaveTargetIds = [...this.rerolledSaveTargetIds, targetId]

        return result
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
                result: rawDmg.result ? {
                    ...rawDmg.result,
                    rolls: rawDmg.result.rolls?.map((r: any) => r && typeof r.toJSON === "function" ? r.toJSON() : r) ?? []
                } : undefined
            },
            saveResults: Object.fromEntries(
                Object.entries(this.saveResults ?? {}).map(([targetId, result]) => [
                    targetId,
                    { ...result, rolls: result.rolls?.map((r: any) => r && typeof r.toJSON === "function" ? r.toJSON() : r) ?? [] }
                ])
            ),
            defenseArmorBonuses: this.defenseArmorBonuses,
            rerolledSaveTargetIds: this.rerolledSaveTargetIds
        }
    }

    static fromJson(snapshot: ComboSubAttackSnapshot): ComboSubAttack {
        const damageRoll = DamageRoll.fromJson(snapshot.damageRoll ? foundry.utils.deepClone(snapshot.damageRoll) : undefined)
        const sub = new ComboSubAttack({
            name: snapshot.name,
            dmgType: damageRoll?.dmgType ?? 'physical',
            dice: damageRoll?.dice ?? [],
            saveTypes: snapshot.saveTypes,
            halfDamageOnSave: snapshot.halfDamageOnSave,
            isSpellAttack: snapshot.isSpellAttack,
            appliedEffects: snapshot.appliedEffects
        })
        sub.damageRoll = damageRoll ?? sub.damageRoll
        sub.saveResults = snapshot.saveResults ? foundry.utils.deepClone(snapshot.saveResults) : {}
        sub.defenseArmorBonuses = snapshot.defenseArmorBonuses ? { ...snapshot.defenseArmorBonuses } : {}
        sub.rerolledSaveTargetIds = snapshot.rerolledSaveTargetIds ? [...snapshot.rerolledSaveTargetIds] : []
        return sub
    }

}

export interface AdversaryComboAttackArgs { comboName: string, subAttacks: ComboSubAttackArgs[] }

export class AdversaryComboAttack extends Attack {

    override readonly attackType = 'combo' as const

    protected override get prefixCountdownWithTargetName(): boolean { return true }

    subAttacks: ComboSubAttack[] = []

    constructor(actor: Actor, args: AdversaryComboAttackArgs, targetIds?: string[]) {
        super(args.comboName, actor, targetIds)
        this.subAttacks = args.subAttacks.map(sub => new ComboSubAttack(sub))
    }

    // The base getter only knows about a single damageRoll; a combo has one per sub-attack.
    override get showDamage(): boolean {
        return this.subAttacks.some(sub => sub.showDamage)
    }

    async initiate() {
        this.id = foundry.utils.randomID()
        for (const sub of this.subAttacks) {
            await sub.rollDamage()
        }
        await this.save(serializeAttack)
        await sendVagabondChatCard(
            this.actor,
            "InteractiveAttackChatCard",
            { actorId: this.actor.id!, attackId: this.id },
            this.subAttacks.flatMap(sub => sub.damageRoll.result?.rolls ?? [])
        )
    }

    async rollSave(subIndex: number, targetId: string, saveType: SavingThrowType, clickEvent?: React.MouseEvent): Promise<SkillCheckResult | undefined> {
        const sub = this.subAttacks[subIndex]
        if (!sub) return

        const result = await sub.rollSave(targetId, saveType, clickEvent)
        if (result) await this.save(serializeAttack)
        return result
    }

    async rerollSave(subIndex: number, targetId: string): Promise<SkillCheckResult | undefined> {
        const sub = this.subAttacks[subIndex]
        if (!sub) return

        const result = await sub.rerollSave(targetId)
        if (result) await this.save(serializeAttack)
        return result
    }

    async recordSaveResult(targetId: string, saveType: SavingThrowType, result: SkillCheckResult, armorBonus?: number): Promise<boolean> {
        if (this.isResolved || !this.targetIds.includes(targetId)) return false
        const recorded = this.subAttacks.map(sub => sub.recordSaveResult(targetId, saveType, result, armorBonus))
        if (!recorded.some(Boolean)) return false
        await this.save(serializeAttack)
        return true
    }

    async setSaveOutcome(subIndex: number, targetId: string, outcome: string): Promise<void> {
        const sub = this.subAttacks[subIndex]
        if (!sub) return

        sub.setSaveOutcome(targetId, outcome)
        await this.save(serializeAttack)
    }

    static build(actor: Actor, args: AdversaryComboAttackArgs, targetIds?: string[]): AdversaryComboAttack {
        return new AdversaryComboAttack(actor, args, targetIds)
    }

    protected override async processDamageRoll(args: AttackResolutionArgs) {
        const rows = this.getDamageSummary(args)
        for (const [index, sub] of this.subAttacks.entries()) {
            await this.processSubAttackDamage(sub, index, rows.filter(row => row.subIndex === index), args)
        }
    }

    private async processSubAttackDamage(sub: ComboSubAttack, subIndex: number, rows: TargetDamageSummary[], args: AttackResolutionArgs) {
        if (!sub.damageRoll.result) return

        for (const row of rows) {
            const actor = canvas?.scene?.tokens?.get(row.targetId)?.actor
            const hp = this.getHP(actor?.system)
            await this.updateHP(actor?.system, hp - row.total)
        }

        await this.applyStatusEffectsForSub(sub, args, rows.filter(row => row.total >= 1).map(row => row.targetId))
    }

    private async applyStatusEffectsForSub(sub: ComboSubAttack, args: AttackResolutionArgs, eligibleTargetIds: string[]) {
        if (sub.appliedEffects.length === 0) return

        // Skip targets who passed the save (half damage only) or wouldn't have taken any damage (e.g. fully mitigated).
        const damagedIds = eligibleTargetIds.filter(id => !sub.isHalfDamageForTarget(id) && sub.calculateAdjustedDamage(id, args) >= 1)
        await this.applyFxToTargets(sub.appliedEffects, damagedIds)
    }

    override getDamageSummary(args: AttackResolutionArgs): TargetDamageSummary[] {
        return this.subAttacks.flatMap((sub, subIndex) => {
            if (!sub.damageRoll.result) return []
            const targetIds = (args.gmTargetsOnly ? getTargetIds() : this.targetIds ?? []).filter(id => sub.shouldApplyDamageToTarget(id))
            return targetIds.map(id => {
                const breakdown = Attack.computeDamageBreakdown(sub.damageRoll, id, args, sub.defenseArmorBonuses[id] ?? 0, sub.isHalfDamageForTarget(id))
                return Attack.buildSummaryRow(id, subIndex, breakdown, 0, args, sub.damageRoll.dmgType, sub.name)
            })
        })
    }

    // Toggles on each sub-attack's configured statuses for failed targets without applying damage, then resolves.
    async applyStatusesAndResolve(args: AttackResolutionArgs, serialize: (attack: Attack) => AttackSnapshot | undefined) {
        if (this.isResolved) return

        for (const sub of this.subAttacks) {
            if (!sub.damageRoll.result) continue
            const targetIds = (args.gmTargetsOnly ? getTargetIds() : this.targetIds ?? [])
                .filter(id => sub.shouldApplyDamageToTarget(id))
            await this.applyStatusEffectsForSub(sub, args, targetIds)
        }

        await this.resolve(serialize)
    }

}