import { CountdownManager } from "../../apps/vagabond-tools/usecase/CountdownManager"
import { getAttackRegistry, setAttackRegistry } from "../../apps/vagabond-tools/usecase/VagabondSettingsHelper"
import { ActorDataModel, BaseActorSchema } from "../../model/actor/ActorDataModel"
import { StatusEffectUtil } from "../../model/actor/util/StatusEffectUtil"
import { physicalDamageTypes } from "../../model/common/sharedSchemas"
import { roll3dDice, sys_id } from "../../utils/foundryUtils"
import { appLang } from "../../utils/lang"
import { getCanvasToken, getTargetIds } from "../../utils/modelUtil"
import { DamageRoll } from "./roll/DamageRoll"
import type { AttackSnapshot } from "./util/attack-serializer"
import { isImmuneToBurning } from "./util/burning-mitigation"

const FOCUS_DAMAGE_LIMIT = 5

export interface AttackResolutionArgs {
    isSpellAttack?: boolean
    bypassArmor?: boolean
    gmTargetsOnly?: boolean
    // GM-entered damage totals, keyed by `${subIndex}:${targetId}` (see damageOverrideKey)
    damageOverrides?: Record<string, number>
}

export const damageOverrideKey = (targetId: string, subIndex = 0) => `${subIndex}:${targetId}`

export interface DamageBreakdown {
    damage: number
    halved: boolean
    // Effective armor after armor piercing (minimum 0)
    armor: number
    armorPiercing: number
    otherMitigation: number
    // Damage after mitigation, before bonus damage
    mitigated: number
}

export interface TargetDamageSummary extends DamageBreakdown {
    targetId: string
    // Index of the combo sub-attack (0 for single attacks)
    subIndex: number
    label?: string
    dmgType: string
    bonus: number
    // Damage that will be applied (the GM override if one was entered)
    total: number
    calculatedTotal: number
    isOverridden: boolean
    healing?: { flat: number, perDie: number, setValue: number }
}

export interface AppliedFx {
    effect: string
    duration?: string
    critDuration?: string
    damageType?: string
}

export abstract class Attack<TActor extends Actor = Actor> {

    abstract readonly attackType: 'adversary' | 'hero' | 'combo'

    // Unique ID for interacting with the attack in chat card
    id: string
    // User ID for keeping track of who has permission to interact in chat card
    userId: string = game.userId ?? ''
    // Used to find the most recent attack targeting a given token
    createdAt: number = Date.now()

    actor: TActor
    targetIds: string[]
    title: string = "Attack"
    damageRoll?: DamageRoll
    get isSpellAttack(): boolean { return false }
    get isEffectOnlySpellAttack(): boolean { return false }
    isResolved: boolean = false
    appliedEffects: AppliedFx[] = []

    constructor(title: string, actor: TActor, targetIds?: string[], damageRoll?: DamageRoll) {
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
        if (this.damageRoll && this.damageRoll.dice.length > 0 && !this.damageRoll?.result) {
            await this.damageRoll.roll(isCrit, this.hasWeakTarget)
            roll3dDice(this.damageRoll?.result?.rolls ?? [])
        }
    }

    async applyDamageAndResolve(args: AttackResolutionArgs, serialize: (attack: Attack) => AttackSnapshot | undefined) {
        if (this.isResolved) return
        await this.processDamageRoll(args)
        await this.processStatusFx(args)
        await this.resolve(serialize)
    }

    async removeTarget(targetId: string, serialize: (attack: Attack) => AttackSnapshot | undefined) {
        this.targetIds = this.targetIds.filter(id => id !== targetId)
        await this.save(serialize)
    }

    async resolve(serialize: (attack: Attack) => AttackSnapshot | undefined) {
        this.isResolved = true
        await this.save(serialize)
    }

    static isImmuneToStatus(actor: Actor | null | undefined, status: string): boolean {
        const immunities: string[] = (actor?.system as any)?.modifiers?.damage?.in?.statusImmunities ?? []
        return immunities.includes(status)
    }

    protected processDamageRoll(args: AttackResolutionArgs): void | Promise<void> {
        if (this.damageRoll?.result) {
            if (this.damageRoll.dmgType === 'healing') {
                this.applyHealing(args)
            }
            else if (this.damageRoll.dmgType === 'mana') {
                this.applyMana(args)
            }
            else if (this.damageRoll.dmgType === 'fatigue') {
                this.applyFatigueDamage(args)
            }
            else {
                this.applyDamage(args)
            }
        }
    }

    private applyHealing(args: AttackResolutionArgs) {
        for (const row of this.getHealingSummary(args)) {
            const target = canvas?.scene?.tokens?.get(row.targetId)?.actor
            if (!target) continue
            this.updateHP(target.system, this.getHP(target.system) + row.total)
        }
    }

    private getHealingSummary(args: AttackResolutionArgs): TargetDamageSummary[] {
        const targetIds = (args.gmTargetsOnly ? getTargetIds() : this.targetIds ?? [])
        const rolled = this.damageRoll?.result?.total ?? 0
        const diceCount = this.damageRoll?.result?.rollSummaries?.length ?? 0
        const rows: TargetDamageSummary[] = []
        for (const id of targetIds) {
            const target = canvas?.scene?.tokens?.get(id)?.actor
            if (!target) continue
            const mods = (target.system as any)?.modifiers?.healing?.in?.modifier ?? {}
            const flat = Number(mods?.flat ?? 0)
            const perDieMod = Number(mods?.perDie ?? 0)
            // A negative per-die modifier can reduce each die to 0 at most.
            const perDie = (this.damageRoll?.result?.rollSummaries ?? [])
                .filter(it => !it.rerolled)
                .reduce((acc, it) => {
                    const value = it.result + (this.damageRoll?.perDieDmgBonus ?? 0)
                    return acc + Math.max(0, value + perDieMod) - value
                }, 0)
            const setValue = Number(mods?.perDieOverride ?? 0) * diceCount
            const calculated = Math.max(0, setValue > 0 ? setValue : rolled + flat + perDie)
            const row = Attack.buildSummaryRow(
                id, 0,
                { damage: rolled, halved: false, armor: 0, armorPiercing: 0, otherMitigation: 0, mitigated: calculated },
                0, args, 'healing', undefined
            )
            rows.push({ ...row, healing: { flat, perDie, setValue } })
        }
        return rows
    }

    private applyMana(args: AttackResolutionArgs) {
        const targetIds = (args.gmTargetsOnly ? getTargetIds() : this.targetIds ?? [])
        this.getActors(targetIds).forEach(target => {
            this.updateMana(
                target?.system,
                this.getMana(target?.system) +
                this.damageRoll?.result?.total
            )
        })
    }

    private applyFatigueDamage(args: AttackResolutionArgs) {
        const targetIds = (args.gmTargetsOnly ? getTargetIds() : this.targetIds ?? []).filter(id => this.shouldApplyDamageToTarget(id))
        targetIds.forEach(id => {
            const actor = canvas?.scene?.tokens?.get(id)?.actor
            const damage = this.damageRoll?.result?.total
            if (!damage || !actor) return
            actor.update({
                'system.statuses.counters.fatigue':
                    (actor.system as any).statuses.counters.fatigue + damage
            } as Record<string, number>)
        })
    }

    // Applies exactly the HP change shown in the damage summary (including any GM overrides).
    private applyDamage(args: AttackResolutionArgs) {
        for (const row of this.getDamageSummary({ ...args, isSpellAttack: this.isSpellAttack })) {
            const targetActor = canvas?.scene?.tokens?.get(row.targetId)?.actor as any
            if (!targetActor) continue

            const adjDamage = row.total
            const weaknesses = targetActor?.system?.modifiers?.damage?.in?.weaknesses ?? []
            const deathRequirements = targetActor?.system?.modifiers?.damage?.in?.deathRequirements

            if ((targetActor.system as ActorDataModel<BaseActorSchema>).statuses.toggles.focusing && adjDamage >= FOCUS_DAMAGE_LIMIT) {
                targetActor.update({ 'system.statuses.counters.focus': 0 } as Record<string, number>)
                StatusEffectUtil.toggleStatusEffectOnce(targetActor, "focusing", false)
            }

            const hp = this.getHP(targetActor?.system)
            const newHp = hp - adjDamage

            const canDie = newHp < 1 && this.checkDeathRequirements(deathRequirements, weaknesses)

            this.updateHP(
                targetActor?.system,
                canDie || newHp >= 1
                    ? newHp
                    : Math.min(hp, 1)
            )
        }
    }

    /**
     * Extra damage from the attacker's being-type modifiers (e.g. bonus vs. undead).
     */
    protected calculateBonusDamage(targetActor: any): number {
        const beingTypes = [
            targetActor?.system?.beingType,
            targetActor?.system?.beingSubtype,
            targetActor?.system?.ancestry?.beingType,
            targetActor?.system?.ancestry?.beingSubtype
        ].filter(Boolean)

        let bonus = 0
        const actorMods = (this.actor?.system as any)?.modifiers ?? {}
        if (actorMods) {
            const beingTypeMods = beingTypes.map(type => actorMods.damage.out.global.beingType[type]).filter(Boolean)
            if (beingTypeMods && beingTypeMods.length > 0) {
                bonus += Math.max(...beingTypeMods.map(mod => mod.bonus.flat))
                bonus += Math.max(...beingTypeMods.map(mod => mod.bonus.perDie)) * (this.damageRoll?.result?.rollSummaries.length ?? 0)
            }
        }
        return bonus
    }

    /**
     * Per-target preview of what "Apply" will do for standard damage. Mirrors applyDamage.
     */
    getDamageSummary(args: AttackResolutionArgs): TargetDamageSummary[] {
        const dmgType = this.damageRoll?.dmgType
        if (this.damageRoll?.result && dmgType === 'healing') return this.getHealingSummary(args)
        if (!this.damageRoll?.result || dmgType === 'mana' || dmgType === 'fatigue') return []

        const summaries: TargetDamageSummary[] = []
        const targetIds = (args.gmTargetsOnly ? getTargetIds() : this.targetIds ?? []).filter(id => this.shouldApplyDamageToTarget(id))
        for (const id of targetIds) {
            const targetActor = canvas?.scene?.tokens?.get(id)?.actor as any
            if (!targetActor) continue
            const breakdown = this.calculateDamageBreakdown(id, { ...args, isSpellAttack: this.isSpellAttack })
            const bonus = this.calculateBonusDamage(targetActor)
            summaries.push(Attack.buildSummaryRow(id, 0, breakdown, bonus, args, this.damageRoll?.dmgType ?? '', undefined))
        }
        return summaries
    }

    static buildSummaryRow(targetId: string, subIndex: number, breakdown: DamageBreakdown, bonus: number, args: AttackResolutionArgs, dmgType: string, label?: string): TargetDamageSummary {
        const calculatedTotal = breakdown.mitigated + bonus
        const override = args.damageOverrides?.[damageOverrideKey(targetId, subIndex)]
        const isOverridden = override !== undefined
        return {
            targetId, subIndex, label, dmgType, ...breakdown, bonus,
            calculatedTotal,
            isOverridden,
            total: isOverridden ? Math.max(0, override) : calculatedTotal
        }
    }

    protected calculateDamageBreakdown(targetId: string, args: AttackResolutionArgs): DamageBreakdown {
        return Attack.computeDamageBreakdown(
            this.damageRoll,
            targetId,
            args,
            this.getAdditionalArmorRating(targetId),
            this.isHalfDamageForTarget(targetId)
        )
    }

    protected shouldApplyDamageToTarget(targetId: string): boolean {
        return !Attack.isImmuneToDamage(targetId, this.damageRoll, this.isSpellAttack)
    }

    static isImmuneToDamage(targetId: string, damageRoll?: DamageRoll, isCast?: boolean): boolean {
        const actor = canvas?.scene?.tokens?.get(targetId)?.actor
        const immunities = (actor?.system as any)?.modifiers?.damage?.in?.immunities ?? []

        if (immunities.includes("magical") && isCast && !physicalDamageTypes().includes(damageRoll?.dmgType ?? "")) return true
        if (immunities.includes("physical") && physicalDamageTypes().includes(damageRoll?.dmgType ?? "")) return true

        return immunities.includes(damageRoll?.dmgType ?? '')
    }

    /**
     * Override as needed to implement custom death requirement checks for different attack types.
     */
    protected checkDeathRequirements(deathRequirements: any, weaknesses: any[]): boolean {
        return true
    }

    static isWeakToDamage(targetId: string, damageRoll?: DamageRoll): boolean {
        const actor = canvas?.scene?.tokens?.get(targetId)?.actor
        const weaknesses: string[] = (actor?.system as any)?.modifiers?.damage?.in?.weaknesses ?? []
        return !!damageRoll?.dmgType && weaknesses.includes(damageRoll.dmgType)
    }

    /**
     * Whether any target is weak to this attack's damage type (i.e. the weakness die should be rolled).
     */
    protected get hasWeakTarget(): boolean {
        return (this.targetIds ?? []).some(id => Attack.isWeakToDamage(id, this.damageRoll))
    }

    protected calculateAdjustedDamage(targetId: string, args: AttackResolutionArgs): number {
        args.isSpellAttack = this.isSpellAttack
        return Attack.computeAdjustedDamage(
            this.damageRoll,
            targetId,
            args,
            this.getAdditionalArmorRating(targetId),
            this.isHalfDamageForTarget(targetId)
        )
    }

    protected isHalfDamageForTarget(_targetId: string): boolean { return false }

    /**
     * Shared damage mitigation (resistances, flat reduction,per-die reduction, armor) for any damage roll.
     */
    static computeAdjustedDamage(damageRoll: DamageRoll | undefined, targetId: string, args: AttackResolutionArgs, additionalArmorRating = 0, halfDamage = false): number {
        return Attack.computeDamageBreakdown(damageRoll, targetId, args, additionalArmorRating, halfDamage).mitigated
    }

    static computeDamageBreakdown(damageRoll: DamageRoll | undefined, targetId: string, args: AttackResolutionArgs, additionalArmorRating = 0, halfDamage = false): DamageBreakdown {
        const actor = canvas?.scene?.tokens?.get(targetId)?.actor
        const aSys = actor?.system as any

        const dmgType = damageRoll?.dmgType ?? ''
        const mods = aSys?.modifiers?.damage?.in ?? {}
        const flatReduction = (mods?.flatReduction?.global ?? 0) + (args.isSpellAttack ? (mods?.flatReduction?.[dmgType] ?? 0) : (mods?.flatReduction?.attack ?? 0))
        const perDieReduction = (mods?.perDieReduction?.global ?? 0) + (mods?.perDieReduction?.[dmgType] ?? 0)
        const isResistant = mods?.resistances?.includes(dmgType)
        const weaknessDice = Attack.isWeakToDamage(targetId, damageRoll) ? (damageRoll?.result?.weaknessRolls ?? []) : []
        const weaknessDamage = weaknessDice.reduce((acc, it) => acc + it.result, 0)
        // Each die's damage (including its per-die bonus) can be reduced to a minimum of zero.
        const perDieMit = [
            ...(damageRoll?.result?.rollSummaries ?? []).filter(it => !it.rerolled).map(it => it.result + (damageRoll?.perDieDmgBonus ?? 0)),
            ...weaknessDice.map(it => it.result)
        ].reduce((acc, value) => acc + Math.min(Math.max(0, value), Math.max(0, perDieReduction)), 0)

        // Resistance and a passed save each halve the damage; they don't stack.
        const totalDamage = (damageRoll?.result?.total ?? 0) + weaknessDamage
        const damage = (isResistant || halfDamage)
            ? Math.floor(totalDamage / 2)
            : totalDamage

        const armorRating = aSys?.armor?.rating ?? 0
        const armorPiercing = damageRoll?.result?.armorPiercing ?? 0
        const armor = args.bypassArmor ? 0 : Math.max(0, armorRating + additionalArmorRating - armorPiercing)
        const otherMitigation = flatReduction + perDieMit
        return {
            damage,
            halved: !!(isResistant || halfDamage),
            armor,
            armorPiercing,
            otherMitigation,
            mitigated: Math.max(0, damage - otherMitigation - armor)
        }
    }

    /**
     * Base function - overridden by AdversaryAttack. Not used for Hero attacks.
     */
    protected getAdditionalArmorRating(_targetId: string): number { return 0 }

    protected get isCriticalHit(): boolean { return false }

    protected shouldApplyEffectsToTarget(targetId: string, _args: AttackResolutionArgs): boolean {
        return this.shouldApplyDamageToTarget(targetId)
    }

    protected async processStatusFx(args: AttackResolutionArgs) {
        if (this.appliedEffects.length === 0) return

        const targetIds = (args.gmTargetsOnly ? getTargetIds() : this.targetIds ?? []).filter(id => this.shouldApplyEffectsToTarget(id, args))
        await this.applyFxToTargets(this.appliedEffects, targetIds)
    }

    protected async applyFxToTargets(effects: AppliedFx[], targetIds: string[]) {
        for (const id of targetIds) {
            const token = getCanvasToken(id)
            const actor = token?.actor ?? canvas?.scene?.tokens?.get(id)?.actor
            if (!actor) continue

            for (const eff of effects) {
                if (Attack.isImmuneToStatus(actor, eff.effect)) continue
                if (eff.effect === "burning" && isImmuneToBurning(actor, eff.damageType)) continue

                const duration = (this.isCriticalHit && eff.critDuration) ? eff.critDuration : eff.duration
                await this.applyEffects(actor, token, eff.effect, duration, eff.damageType)
            }
        }
    }

    protected get prefixCountdownWithTargetName(): boolean { return false }

    // Countdown durations (e.g. "Cd6") additionally spawn a Countdown die to track it.
    private async applyEffects(actor: Actor, token: Token | undefined, status: string, duration?: string, damageType?: string) {
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
                undefined, undefined,
                actor.uuid,
                token?.document?.uuid,
                { id: status, damageType: damageType }
            )
        }
    }

    protected getActors(targetIds: string[]) {
        return targetIds.map(id => canvas?.scene?.tokens?.get(id)?.actor)
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
            await Attack.handleIncomingAttackSnapshot({ actorId: this.actor.id, snapshot })
            return
        }
        /**
         * IF USER IS PLAYER: route the atk snapshot thru the socket
         * to the GM's client so it can be saved to world settings.
         */
        const payload = {
            action: "saveAttackSnapshot", data: {
                actorId: this.actor.id,
                snapshot: snapshot
            }
        }
        game.socket?.emit(`system.${sys_id}`, payload)
    }

    static async handleIncomingAttackSnapshot(payload: { actorId: string, snapshot: AttackSnapshot }) {
        const { actorId, snapshot } = payload
        const registryRaw = getAttackRegistry()
        const attackRegistry =
            typeof registryRaw === "string"
                ? JSON.parse(registryRaw)
                : (registryRaw || {})

        if (!attackRegistry[actorId]) {
            attackRegistry[actorId] = []
        }

        const currentAttacks: AttackSnapshot[] = attackRegistry[actorId]
        const exists = currentAttacks.some(it => it.id === snapshot.id)

        const updatedAttacks = exists
            ? currentAttacks.map(it => it.id === snapshot.id
                ? snapshot
                : it
            )
            : [...currentAttacks, snapshot]

        // Keep only the last 50 attacks for each actor.
        attackRegistry[actorId] = updatedAttacks.slice(-50)

        await setAttackRegistry(attackRegistry)
    }

}