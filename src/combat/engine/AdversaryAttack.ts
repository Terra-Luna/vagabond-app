import type { HeroDataModel } from "../../model/actor/HeroDataModel"
import { appLang } from "../../utils/lang"
import { sendVagabondChatCard } from "../../view/chat/ChatCardSerializer"
import { AppliedFx, Attack, AttackResolutionArgs } from "./Attack"
import { HeroAttack } from "./HeroAttack"
import { DamageRoll } from "./roll/DamageRoll"
import { DiceRoll } from "./roll/DiceRoll"
import { buildManualSaveResult, SkillCheck, SkillCheckResult } from "./roll/SkillCheck"
import type { AttackSnapshot } from "./util/attack-serializer"
import { serializeAttack } from "./util/attack-serializer"

export type SavingThrowType = 'reflex' | 'endure' | 'will' | 'defend'

export interface AdversaryAttackArgs {
    attackName: string,
    dmgType: string,
    dice: DiceRoll[],
    saveTypes?: SavingThrowType[],
    description?: string,
    halfDamageOnSave?: boolean,
    isSpellAttack?: boolean,
    appliedEffects?: AppliedFx[]
}

export class AdversaryAttack extends Attack {

    override readonly attackType = 'adversary' as const

    protected override get prefixCountdownWithTargetName(): boolean { return true }

    // The base class getter is read-only; adversary actions choose Attack vs. Cast per action.
    private _isSpellAttack: boolean = false
    override get isSpellAttack(): boolean { return this._isSpellAttack }
    override set isSpellAttack(value: boolean) { this._isSpellAttack = value }

    saveTypes: SavingThrowType[] = []
    saveResults: Record<string, SkillCheckResult> = {}
    defenseArmorBonuses: Record<string, number> = {}
    rerolledSaveTargetIds: string[] = []
    description: string = ''
    halfDamageOnSave: boolean = false

    constructor(
        actor: Actor,
        args: AdversaryAttackArgs,
        targetIds?: string[]
    ) {
        super(args.attackName, actor, targetIds, new DamageRoll({
            atkName: args.attackName,
            dmgType: args.dmgType,
            dice: args.dice
        }))
        this.saveTypes = args.saveTypes ?? []
        this.description = args.description ?? ''
        this.halfDamageOnSave = args.halfDamageOnSave ?? false
        this._isSpellAttack = args.isSpellAttack ?? false
        this.appliedEffects = args.appliedEffects ?? []
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
        const dmgMods = (this.actor.system as any)?.modifiers?.damage?.out
        if (dmgMods && this.damageRoll) {
            this.damageRoll.flatDmgBonus += dmgMods.global.bonus.flat ?? 0
            this.damageRoll.perDieDmgBonus += dmgMods.global.bonus.perDie ?? 0
        }
        if (this.damageRoll && this.damageRoll.dice.length > 0 && !this.damageRoll?.result) {
            await this.damageRoll.roll(isCrit)
            if (this.damageRoll && this.damageRoll.result) {
                this.damageRoll.result.total += this.damageRoll.flatDmgBonus + (this.damageRoll.perDieDmgBonus * this.damageRoll.dice.length)
            }
        }
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
        await this.save(serializeAttack)

        return result
    }

    /**
     * Injects a save rolled from the Hero sheet (or wherever) into the attack's chat card save results.
     */
    async recordSaveResult(targetId: string, saveType: SavingThrowType, result: SkillCheckResult): Promise<boolean> {
        if (this.isResolved || !this.targetIds.includes(targetId) || !this.saveTypes.includes(saveType)) return false

        const existing = this.saveResults[targetId]
        if (existing) {
            if (existing.outcome !== appLang.RollResult.failure || this.rerolledSaveTargetIds.includes(targetId)) return false
            this.rerolledSaveTargetIds = [...this.rerolledSaveTargetIds, targetId]
            this.defenseArmorBonuses = Object.fromEntries(
                Object.entries(this.defenseArmorBonuses).filter(([id]) => id !== targetId)
            )
        }

        this.saveResults = { ...this.saveResults, [targetId]: result }
        await this.save(serializeAttack)
        return true
    }

    /**
     * GM override: sets (or replaces) a target's save outcome.
     */
    async setSaveOutcome(targetId: string, outcome: string): Promise<void> {
        const skill = this.saveTypes.find(type => type !== 'defend') ?? 'reflex'
        this.saveResults = { ...this.saveResults, [targetId]: buildManualSaveResult(skill, outcome) }
        this.defenseArmorBonuses = Object.fromEntries(
            Object.entries(this.defenseArmorBonuses).filter(([id]) => id !== targetId)
        )
        await this.save(serializeAttack)
    }

    /**
     * Spends a Luck to reroll a failed save with the same skill as
     * the original attempt. Only one reroll per target is allowed via
     * this method. GM's can override the save outcome directly if needed.
     */
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
        }
        else {
            result = await new SkillCheck(hero, { type: 'save', skill: existing.skill, favorHinder }).roll()
        }
        this.saveResults = { ...this.saveResults, [targetId]: result }
        this.rerolledSaveTargetIds = [...this.rerolledSaveTargetIds, targetId]
        await this.save(serializeAttack)

        return result
    }

    static build(actor: Actor, args: AdversaryAttackArgs, targetIds?: string[]): AdversaryAttack {
        return new AdversaryAttack(actor, args, targetIds)
    }

    protected override getAdditionalArmorRating(targetId: string): number {
        return this.defenseArmorBonuses[targetId] ?? 0
    }

    /**
     * A target who succeeded (or crit) their saving throw takes no damage.
     */ 
    protected override shouldApplyDamageToTarget(targetId: string): boolean {
        const result = this.saveResults[targetId]
        if (this.defenseArmorBonuses[targetId] !== undefined) {
            return result.outcome !== appLang.RollResult.crit
        }
        else {
            return !result
                || result.outcome === appLang.RollResult.failure
                || (result.outcome === appLang.RollResult.success && this.halfDamageOnSave)
        }
    }

    protected override isHalfDamageForTarget(targetId: string): boolean {
        return this.halfDamageOnSave
            && this.defenseArmorBonuses[targetId] === undefined
            && this.saveResults[targetId]?.outcome === appLang.RollResult.success
    }

    // Effects only apply to targets who failed (or didn't make) a save and still took damage.
    protected override shouldApplyEffectsToTarget(targetId: string, args: AttackResolutionArgs): boolean {
        return this.shouldApplyDamageToTarget(targetId)
            && !this.isHalfDamageForTarget(targetId)
            && this.calculateAdjustedDamage(targetId, args) >= 1
    }

    async applyStatusesAndResolve(args: AttackResolutionArgs, serialize: (attack: Attack) => AttackSnapshot | undefined) {
        if (this.isResolved) return
        await this.processStatusFx(args)
        await this.resolve(serialize)
    }

}