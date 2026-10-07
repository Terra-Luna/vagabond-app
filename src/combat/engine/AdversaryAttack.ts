import type { HeroDataModel } from "../../model/actor/HeroDataModel"
import { roll3dDice } from "../../utils/foundryUtils"
import { appLang } from "../../utils/lang"
import { getTargetIds } from "../../utils/modelUtil"
import { sendVagabondChatCard } from "../../view/chat/ChatCardSerializer"
import { Attack, AttackResolutionArgs } from "./Attack"
import { HeroAttack } from "./HeroAttack"
import { DamageRoll } from "./roll/DamageRoll"
import { DiceRoll } from "./roll/DiceRoll"
import { SkillCheck, SkillCheckResult } from "./roll/SkillCheck"
import type { AttackSnapshot } from "./util/attack-serializer"
import { serializeAttack } from "./util/attack-serializer"

export type SavingThrowType = 'reflex' | 'endure' | 'will' | 'defend'

export interface AdversaryAttackArgs { attackName: string, dmgType: string, dice: DiceRoll[], saveTypes?: SavingThrowType[], description?: string, statuses?: string[] }

export class AdversaryAttack extends Attack {

    override readonly attackType = 'adversary' as const
    override actor: Actor
    override targetIds: string[]

    saveTypes: SavingThrowType[] = []
    saveResults: Record<string, SkillCheckResult> = {}
    defenseArmorBonuses: Record<string, number> = {}
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
            roll3dDice(this.damageRoll.result?.rolls ?? [])
        }
    }

    async rollSave(targetId: string, saveType: SavingThrowType, clickEvent?: React.MouseEvent): Promise<SkillCheckResult | undefined> {
        // Defend is offered whenever a Reflex save is allowed.
        const isAllowed = saveType === 'defend' ? this.saveTypes.includes('reflex') : this.saveTypes.includes(saveType)
        if (!isAllowed || this.saveResults[targetId]) return

        const targetActor = canvas?.scene?.tokens?.get(targetId)?.actor
        if (!targetActor) return

        const hero = targetActor.system as HeroDataModel
        const defenseWeapons = saveType === 'defend' ? hero.defenseWeapons() : []
        const weapon = defenseWeapons[0]
        if (saveType === 'defend' && !weapon) return

        const skill = weapon
            ? HeroAttack.getHighestDefaultWeaponSkill(hero, weapon.system)?.skill
            : saveType
        if (!skill) return

        const skillCheck = new SkillCheck(hero, { type: 'save', skill, item: weapon?.system, clickEvent: clickEvent as any })
        const result = await skillCheck.roll()

        if (saveType === 'defend' &&
            (result.outcome === appLang.RollResult.success || result.outcome === appLang.RollResult.crit)) {
            const defenseRolls: Roll[] = []
            let armorBonus = 0

            for (const defenseWeapon of defenseWeapons) {
                const weaponSkill = HeroAttack.getHighestDefaultWeaponSkill(hero, defenseWeapon.system)?.skill
                if (!weaponSkill) continue

                const damageDice = DiceRoll.getItemDamageWithHeroMods(hero, weaponSkill, defenseWeapon.system)
                const damageRoll = new DamageRoll({
                    atkName: defenseWeapon.name,
                    dmgType: defenseWeapon.system.damage.type,
                    dice: [new DiceRoll(damageDice)]
                })
                const damageResult = await damageRoll.roll()
                armorBonus += damageResult.total
                defenseRolls.push(...damageResult.rolls)
            }

            this.defenseArmorBonuses = { ...this.defenseArmorBonuses, [targetId]: armorBonus }
            roll3dDice(defenseRolls)
        }

        this.saveResults = { ...this.saveResults, [targetId]: result }
        await this.save(serializeAttack)

        return result
    }

    // Spends a Luck to reroll a failed save with the same skill as the original attempt. Only one reroll per target is allowed.
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

        // Reroll the original attempt's Favor/Hinder.
        const skillCheck = new SkillCheck(hero, {
            type: 'save',
            skill: existing.skill,
            favorHinder: existing.favorHinder as 'favor' | 'hinder' | 'none'
        })

        const result = await skillCheck.roll()

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
     * @param targetId 
     * @returns 
     */ 
    protected override shouldApplyDamageToTarget(targetId: string): boolean {
        const result = this.saveResults[targetId]
        if (this.defenseArmorBonuses[targetId] !== undefined) return true
        return !result || result.outcome === appLang.RollResult.failure
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
            this.statuses
                .filter(status => !Attack.isImmuneToStatus(actor, status))
                .forEach(status => actor?.toggleStatusEffect(status, { active: true }))
        })
    }

    async applyStatusesAndResolve(args: AttackResolutionArgs, serialize: (attack: Attack) => AttackSnapshot | undefined) {
        if (this.isResolved) return
        this.applyStatusEffects(args)
        await this.resolve(serialize)
    }

}