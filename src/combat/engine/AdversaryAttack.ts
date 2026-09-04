import type { HeroDataModel } from "../../model/actor/HeroDataModel"
import { roll3dDice } from "../../utils/foundryUtils"
import { appLang } from "../../utils/lang"
import { getTargetIds } from "../../utils/modelUtil"
import { sendVagabondChatCard } from "../../view/chat/ChatCardSerializer"
import { Attack, AttackResolutionArgs } from "./Attack"
import { DamageRoll } from "./roll/DamageRoll"
import { DiceRoll } from "./roll/DiceRoll"
import { SkillCheck, SkillCheckResult } from "./roll/SkillCheck"
import type { AttackSnapshot } from "./util/attack-serializer"
import { serializeAttack } from "./util/attack-serializer"

export type SavingThrowType = 'reflex' | 'endure' | 'will'

export interface AdversaryAttackArgs { attackName: string, dmgType: string, dice: DiceRoll[], saveTypes?: SavingThrowType[], description?: string, statuses?: string[] }

export class AdversaryAttack extends Attack {

    override readonly attackType = 'adversary' as const
    override actor: Actor
    override targetIds: string[]

    saveTypes: SavingThrowType[] = []
    saveResults: Record<string, SkillCheckResult> = {}
    rerolledSaveTargetIds: string[] = []
    description: string = ''
    statuses: string[] = []

    constructor(
        actor: Actor,
        args: AdversaryAttackArgs,
        targetIds?: string[]
    ) {
        super(args.attackName)
        this.actor = actor
        this.targetIds = targetIds ?? []
        this.saveTypes = args.saveTypes ?? []
        this.description = args.description ?? ''
        this.statuses = args.statuses ?? []
        this.damageRoll = new DamageRoll({
            atkName: args.attackName,
            dmgType: args.dmgType,
            dice: args.dice
        })
    }

    async initiate() {
        this.id = foundry.utils.randomID()
        await this.rollDamage()
        await this.save(serializeAttack)
        await sendVagabondChatCard(
            this.actor,
            "InteractiveAttackChatCard",
            { actorId: this.actor.id!, attackId: this.id },
            [...this.damageRoll?.result?.rolls ?? []]
        )
    }

    override async rollDamage(isCrit?: boolean) {
        if (this.damageRoll && this.damageRoll.dice.length > 0 && !this.damageRoll?.result) {
            await this.damageRoll.roll(isCrit)
        }
    }

    async rollSave(targetId: string, saveType: SavingThrowType, blockDie?: number, clickEvent?: React.MouseEvent): Promise<SkillCheckResult | undefined> {
        if (!this.saveTypes.includes(saveType) || this.saveResults[targetId]) return

        const targetActor = canvas?.scene?.tokens?.get(targetId)?.actor
        if (!targetActor) return

        const skillCheck = new SkillCheck(targetActor.system as HeroDataModel, { type: 'save', skill: saveType, blockDie, clickEvent: clickEvent as any })
        const result = await skillCheck.roll()

        this.saveResults = { ...this.saveResults, [targetId]: result }
        roll3dDice(result.rolls)
        await this.save(serializeAttack)

        return result
    }

    // Spends a Luck to reroll a failed save with the same skill as the original attempt.
    // Only one reroll per target is allowed and Block (defense weapon) rolls are not eligible.
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

        // Reroll the original attempt's Favor/Hinder.
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
        await this.save(serializeAttack)

        return result
    }

    static build(actor: Actor, args: AdversaryAttackArgs, targetIds?: string[]): AdversaryAttack {
        return new AdversaryAttack(actor, args, targetIds)
    }

    /**
     * A target who succeeded (or crit) their saving throw takes no damage/healing. A Block roll (die +/-
     * Favor/Hinder) that meets or beats the Reflex difficulty also negates all damage; otherwise its die
     * result only grants bonus armor (see getBonusArmor).
     * @param targetId 
     * @returns 
     */ 
    protected override shouldApplyDamageToTarget(targetId: string): boolean {
        const result = this.saveResults[targetId]
        if (result?.blockDie) return result.total < result.difficulty
        return !result || result.outcome === appLang.RollResult.failure
    }

    // A Block roll counts its weapon damage die (but not any Favor/Hinder d6) as bonus armor.
    protected override getBonusArmor(targetId: string): number {
        const result = this.saveResults[targetId]
        if (!result?.blockDie) return 0
        return result.d20s?.reduce((sum, val) => sum + val, 0) ?? 0
    }

    protected override processDamageRoll(args: AttackResolutionArgs) {
        super.processDamageRoll(args)
        this.applyStatusEffects(args)
    }

    private applyStatusEffects(args: AttackResolutionArgs) {
        if (this.statuses.length === 0) return

        const targetIds = (args.gmTargetsOnly ? getTargetIds() : this.targetIds ?? []).filter(id => this.shouldApplyDamageToTarget(id))

        targetIds.forEach(id => {
            // Skip targets who wouldn't have taken any damage from this attack (e.g. fully mitigated).
            if (this.calculateAdjustedDamage(id, args) < 1) return
            const actor = canvas?.scene?.tokens?.get(id)?.actor
            this.statuses.forEach(status => actor?.toggleStatusEffect(status, { active: true }))
        })
    }

    async applyStatusesAndResolve(args: AttackResolutionArgs, serialize: (attack: Attack) => AttackSnapshot | undefined) {
        if (this.isResolved) return
        this.applyStatusEffects(args)
        await this.resolve(serialize)
    }

}