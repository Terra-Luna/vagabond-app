import { getFollowerContext } from "../../model/actor/util/NpcDataModelUtil"
import { appLang } from "../../utils/lang"
import { canInitiateAttack } from "../../utils/modelUtil"
import { AppliedFx, Attack, AttackResolutionArgs } from "./Attack"
import { DamageRoll } from "./roll/DamageRoll"
import { DiceRoll } from "./roll/DiceRoll"
import { SkillCheck, SkillCheckResult } from "./roll/SkillCheck"
import { applyAdversaryDamageMods } from "./util/adversary-damage-mods"
import type { AttackSnapshot } from "./util/attack-serializer"
import { serializeAttack } from "./util/attack-serializer"
import {
    isDamagedAfterSave, isHalvedBySave, overrideTargetSave, recordTargetSave, rerollTargetSave, rollTargetSave
} from "./util/save-state"

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
    skillCheck?: SkillCheck
    halfDamageOnSave: boolean = false

    constructor(
        actor: Actor,
        args: AdversaryAttackArgs,
        targetIds?: string[]
    ) {
        super(args.attackName, actor, targetIds, DamageRoll.forAdversary({
            atkName: args.attackName,
            dmgType: args.dmgType,
            dice: args.dice
        }))
        this.saveTypes = args.saveTypes ?? []
        this.description = args.description ?? ''
        this.halfDamageOnSave = args.halfDamageOnSave ?? false
        this._isSpellAttack = args.isSpellAttack ?? false
        this.appliedEffects = (args.appliedEffects ?? []).map(eff => ({ ...eff, damageType: eff.damageType ?? args.dmgType }))
    }

    async initiate(clickEvent?: any) {
        if (!canInitiateAttack(this.actor)) return
        this.id = foundry.utils.randomID()

        // An NPC following a Hero attacks with that Hero's skill; failing the check means no damage.
        const follower = getFollowerContext(this.actor)
        if (follower) {
            this.skillCheck = new SkillCheck(follower.hero.system, { type: 'attack', skill: follower.skill, clickEvent })
            await this.skillCheck.roll()
        }

        if (this.skillCheck?.result?.outcome === appLang.RollResult.failure) {
            this.isResolved = true
        }
        else {
            await this.rollDamage(this.skillCheck?.result?.outcome === appLang.RollResult.crit)
        }
        await this.save(serializeAttack)
        await this.postChatCard([...this.skillCheck?.result?.rolls ?? [], ...this.damageRoll?.result?.rolls ?? []])
    }

    override async rollDamage(isCrit?: boolean) {
        const damageRoll = this.damageRoll
        if (!damageRoll || damageRoll.result) return

        const { alwaysWeak } = applyAdversaryDamageMods(this.actor, damageRoll, this.isSpellAttack)
        if (await Attack.rollDamageOnce(damageRoll, isCrit, this.targetIds, alwaysWeak) && this.damageRoll?.result) {
            this.damageRoll.result.total += this.damageRoll.flatDmgBonus
        }
    }

    async rollSave(targetId: string, saveType: SavingThrowType, clickEvent?: React.MouseEvent): Promise<SkillCheckResult | undefined> {
        const result = await rollTargetSave(this, targetId, saveType, clickEvent)
        if (result) await this.saveOrAutoResolve(serializeAttack)
        return result
    }

    /**
     * Every target has saved and takes no damage, so there's nothing left to apply.
     */
    protected override get isNegatedForAllTargets(): boolean {
        return this.targetIds.length > 0
            && this.targetIds.every(id => !!this.saveResults[id] && !this.shouldApplyDamageToTarget(id))
    }

    /**
     * Injects a save rolled from the Hero sheet (or wherever) into the attack's chat card save results.
     */
    async recordSaveResult(targetId: string, saveType: SavingThrowType, result: SkillCheckResult, armorBonus?: number): Promise<boolean> {
        if (this.isResolved || !this.targetIds.includes(targetId)) return false
        if (!recordTargetSave(this, targetId, saveType, result, armorBonus)) return false
        await this.saveOrAutoResolve(serializeAttack)
        return true
    }

    /**
     * GM override: sets (or replaces) a target's save outcome.
     */
    async setSaveOutcome(targetId: string, outcome: string): Promise<void> {
        overrideTargetSave(this, targetId, outcome)
        await this.saveOrAutoResolve(serializeAttack)
    }

    async rerollSave(targetId: string): Promise<SkillCheckResult | undefined> {
        const result = await rerollTargetSave(this, targetId)
        if (result) await this.saveOrAutoResolve(serializeAttack)
        return result
    }

    static build(actor: Actor, args: AdversaryAttackArgs, targetIds?: string[]): AdversaryAttack {
        return new AdversaryAttack(actor, args, targetIds)
    }

    protected override getAdditionalArmorRating(targetId: string): number {
        return this.defenseArmorBonuses[targetId] ?? 0
    }

    protected override shouldApplyDamageToTarget(targetId: string): boolean {
        return super.shouldApplyDamageToTarget(targetId) && isDamagedAfterSave(this, targetId)
    }

    protected override isHalfDamageForTarget(targetId: string): boolean {
        return isHalvedBySave(this, targetId)
    }

    // Effects only apply to targets who failed (or didn't make) a save. Damaging attacks also require the target to take damage.
    protected override shouldApplyEffectsToTarget(targetId: string, args: AttackResolutionArgs): boolean {
        if (!this.showDamage || this.damageRoll?.dmgType === "none") {
            return super.shouldApplyDamageToTarget(targetId)
                && isDamagedAfterSave(this, targetId)
                && !this.isHalfDamageForTarget(targetId)
        }
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