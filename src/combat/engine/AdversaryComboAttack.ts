import type { HeroDataModel } from "../../model/actor/HeroDataModel"
import { roll3dDice } from "../../utils/foundryUtils"
import { appLang } from "../../utils/lang"
import { getTargetIds } from "../../utils/modelUtil"
import { sendVagabondChatCard } from "../../view/chat/ChatCardSerializer"
import type { SavingThrowType } from "./AdversaryAttack"
import { Attack, AttackResolutionArgs } from "./Attack"
import { DamageRoll } from "./roll/DamageRoll"
import { DiceRoll } from "./roll/DiceRoll"
import { SkillCheck, SkillCheckResult } from "./roll/SkillCheck"
import type { AttackSnapshot, ComboSubAttackSnapshot } from "./util/attack-serializer"
import { serializeAttack } from "./util/attack-serializer"

export interface ComboSubAttackArgs { name: string, dmgType: string, dice: DiceRoll[], saveTypes?: SavingThrowType[], statuses?: string[] }

/**
 * One repetition of an action within an Adversary combo (e.g. one of "2x Claw"). Mirrors AdversaryAttack's
 * save/damage/status handling, but scoped to its own damage roll and save results.
 */
export class ComboSubAttack {

    name: string
    damageRoll: DamageRoll
    saveTypes: SavingThrowType[] = []
    statuses: string[] = []
    saveResults: Record<string, SkillCheckResult> = {}
    rerolledSaveTargetIds: string[] = []

    constructor(args: ComboSubAttackArgs) {
        this.name = args.name
        this.saveTypes = args.saveTypes ?? []
        this.statuses = args.statuses ?? []
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
        const result = this.saveResults[targetId]
        if (result?.blockDie) return result.total < result.difficulty
        return !result || result.outcome === appLang.RollResult.failure
    }

    getBonusArmor(targetId: string): number {
        const result = this.saveResults[targetId]
        if (!result?.blockDie) return 0
        return result.d20s?.reduce((sum, val) => sum + val, 0) ?? 0
    }

    calculateAdjustedDamage(targetId: string, args: AttackResolutionArgs): number {
        const actor = canvas?.scene?.tokens?.get(targetId)?.actor
        let damage = this.damageRoll.result?.total ?? 0
        damage = args.halveDamage ? Math.ceil(damage / 2) : damage

        const target = actor?.system
        const armorRating = (target as any)?.armor?.rating ?? 0
        const armorPiercing = this.damageRoll.armorPiercing ?? 0
        const armor = args.bypassArmor ? 0 : Math.max(0, armorRating + this.getBonusArmor(targetId) - armorPiercing)
        return Math.max(0, damage - armor)
    }

    async rollSave(targetId: string, saveType: SavingThrowType, blockDie?: number, clickEvent?: React.MouseEvent): Promise<SkillCheckResult | undefined> {
        if (!this.saveTypes.includes(saveType) || this.saveResults[targetId]) return

        const targetActor = canvas?.scene?.tokens?.get(targetId)?.actor
        if (!targetActor) return

        const skillCheck = new SkillCheck(targetActor.system as HeroDataModel, { type: 'save', skill: saveType, blockDie, clickEvent: clickEvent as any })
        const result = await skillCheck.roll()

        this.saveResults = { ...this.saveResults, [targetId]: result }
        // No chat message is created for save rolls, so animate them manually.
        roll3dDice(result.rolls)

        return result
    }

    async rerollSave(targetId: string): Promise<SkillCheckResult | undefined> {
        const existing = this.saveResults[targetId]
        if (!existing || existing.outcome !== appLang.RollResult.failure) return
        if (existing.blockDie) return
        if (this.rerolledSaveTargetIds.includes(targetId)) return

        const targetActor = canvas?.scene?.tokens?.get(targetId)?.actor
        if (!targetActor) return

        const hero = targetActor.system as HeroDataModel
        const luck = hero.statuses?.counters?.luck ?? 0
        if (luck <= 0) return

        await targetActor.update(
            { 'system.statuses.counters.luck': luck - 1 } as Record<string, number>,
            { ['skipTrackerChatCard' as string]: true }
        )

        const skillCheck = new SkillCheck(hero, {
            type: 'save',
            skill: existing.skill,
            blockDie: existing.blockDie,
            favorHinder: existing.favorHinder as 'favor' | 'hinder' | 'none'
        })
        const result = await skillCheck.roll()

        this.saveResults = { ...this.saveResults, [targetId]: result }
        this.rerolledSaveTargetIds = [...this.rerolledSaveTargetIds, targetId]
        roll3dDice(result.rolls)

        return result
    }

    toJson(): ComboSubAttackSnapshot {
        const rawDmg = this.damageRoll.toJson()
        return {
            name: this.name,
            saveTypes: this.saveTypes,
            statuses: this.statuses,
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
            statuses: snapshot.statuses
        })
        sub.damageRoll = damageRoll ?? sub.damageRoll
        sub.saveResults = snapshot.saveResults ? foundry.utils.deepClone(snapshot.saveResults) : {}
        sub.rerolledSaveTargetIds = snapshot.rerolledSaveTargetIds ? [...snapshot.rerolledSaveTargetIds] : []
        return sub
    }

}

export interface AdversaryComboAttackArgs { comboName: string, subAttacks: ComboSubAttackArgs[] }

export class AdversaryComboAttack extends Attack {

    override readonly attackType = 'combo' as const
    override actor: Actor
    override targetIds: string[]

    subAttacks: ComboSubAttack[] = []

    constructor(actor: Actor, args: AdversaryComboAttackArgs, targetIds?: string[]) {
        super(args.comboName)
        this.actor = actor
        this.targetIds = targetIds ?? []
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

    async rollSave(subIndex: number, targetId: string, saveType: SavingThrowType, blockDie?: number, clickEvent?: React.MouseEvent): Promise<SkillCheckResult | undefined> {
        const sub = this.subAttacks[subIndex]
        if (!sub) return

        const result = await sub.rollSave(targetId, saveType, blockDie, clickEvent)
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

    static build(actor: Actor, args: AdversaryComboAttackArgs, targetIds?: string[]): AdversaryComboAttack {
        return new AdversaryComboAttack(actor, args, targetIds)
    }

    // Overridden wholesale since the base implementation only knows about a single damageRoll.
    protected override processDamageRoll(args: AttackResolutionArgs) {
        this.subAttacks.forEach(sub => this.processSubAttackDamage(sub, args))
    }

    private processSubAttackDamage(sub: ComboSubAttack, args: AttackResolutionArgs) {
        if (!sub.damageRoll.result) return

        const targetIds = (args.gmTargetsOnly ? getTargetIds() : this.targetIds ?? [])
            .filter(id => sub.shouldApplyDamageToTarget(id))

        targetIds.forEach(id => {
            const actor = canvas?.scene?.tokens?.get(id)?.actor
            if (sub.damageRoll.dmgType === 'healing') {
                this.updateHP(actor?.system, this.getHP(actor?.system) + (sub.damageRoll.result?.total ?? 0))
            }
            else {
                const adjDamage = sub.calculateAdjustedDamage(id, args)
                this.updateHP(actor?.system, this.getHP(actor?.system) - adjDamage)
            }
        })

        this.applyStatusEffectsForSub(sub, args, targetIds)
    }

    private applyStatusEffectsForSub(sub: ComboSubAttack, args: AttackResolutionArgs, eligibleTargetIds: string[]) {
        if (sub.statuses.length === 0) return

        eligibleTargetIds.forEach(id => {
            // Skip targets who wouldn't have taken any damage from this sub-attack (e.g. fully mitigated).
            if (sub.calculateAdjustedDamage(id, args) < 1) return
            const actor = canvas?.scene?.tokens?.get(id)?.actor
            sub.statuses.forEach(status => actor?.toggleStatusEffect(status, { active: true }))
        })
    }

    // Toggles on each sub-attack's configured statuses for failed targets without applying damage, then resolves.
    async applyStatusesAndResolve(args: AttackResolutionArgs, serialize: (attack: Attack) => AttackSnapshot | undefined) {
        if (this.isResolved) return

        this.subAttacks.forEach(sub => {
            if (!sub.damageRoll.result) return
            const targetIds = (args.gmTargetsOnly ? getTargetIds() : this.targetIds ?? [])
                .filter(id => sub.shouldApplyDamageToTarget(id))
            this.applyStatusEffectsForSub(sub, args, targetIds)
        })

        await this.resolve(serialize)
    }

}