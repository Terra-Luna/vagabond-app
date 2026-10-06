import { addCountdown, getAttackRegistry, setAttackRegistry } from "../../apps/vagabond-tools/usecase/VagabondSettingsHelper"
import { roll3dDice, showFloatingText, sys_id } from "../../utils/foundryUtils"
import { appLang } from "../../utils/lang"
import { getCanvasToken, getTargetIds } from "../../utils/modelUtil"
import { DamageRoll } from "./roll/DamageRoll"
import type { AttackSnapshot } from "./util/attack-serializer"

export interface AttackResolutionArgs {
    flanked?: boolean
    bypassArmor?: boolean
    gmTargetsOnly?: boolean
}

export interface AppliedFx {
    effect: string
    duration?: string
    critDuration?: string
    damageType?: string
}

export abstract class Attack {

    abstract readonly attackType: 'adversary' | 'hero' | 'combo'

    // Unique ID for interacting with the attack in chat card
    id: string
    // User ID for keeping track of who has permission to interact in chat card
    userId: string = game.userId ?? ''

    abstract actor: Actor
    abstract targetIds?: string[]
    title: string = "Attack"
    damageRoll?: DamageRoll
    isResolved: boolean = false
    appliedEffects: AppliedFx[] = []

    constructor(title) {
        this.id = foundry.utils.randomID()
        this.title = title
    }

    get showTargets(): boolean {
        return (this.targetIds?.length ?? 0) > 0
    }

    get showDamage(): boolean {
        return (this.damageRoll?.result?.total ?? 0) > 0
    }

    async rollDamage(isCrit?: boolean) {
        if (this.damageRoll && this.damageRoll.dice.length > 0 && !this.damageRoll?.result) {
            await this.damageRoll.roll(isCrit)
            roll3dDice(this.damageRoll?.result?.rolls ?? [])
        }
    }

    async applyDamageAndResolve(args: AttackResolutionArgs, serialize: (attack: Attack) => AttackSnapshot | undefined) {
        if (this.isResolved) return
        await this.processDamageRoll(args)
        await this.processStatusFx(args)
        await this.resolve(serialize)
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
            else if (this.damageRoll.dmgType === 'fatigue') {
                this.applyFatigueDamage(args)
            }
            else {
                this.applyDamage(args)
            }
        }
    }

    private applyHealing(args: AttackResolutionArgs) {
        const targetIds = (args.gmTargetsOnly ? getTargetIds() : this.targetIds ?? []).filter(id => this.shouldApplyDamageToTarget(id))
        this.getActors(targetIds).forEach(target => {
            this.updateHP(target?.system, this.getHP(target?.system) + (this.damageRoll?.result?.total ?? 0))
        })
    }

    private applyFatigueDamage(args: AttackResolutionArgs) {
        const targetIds = (args.gmTargetsOnly ? getTargetIds() : this.targetIds ?? []).filter(id => this.shouldApplyDamageToTarget(id))
        targetIds.forEach(id => {
            const token = getCanvasToken(id)
            const actor = token?.actor ?? canvas?.scene?.tokens?.get(id)?.actor
            const damage = this.damageRoll?.result?.total
            if (!damage || !actor) return
            showFloatingText(token ?? actor, damage, { isHealing: false, color: "#f39c12" })
            actor.update({
                'system.statuses.counters.fatigue':
                    (actor.system as any).statuses.counters.fatigue + damage
            } as Record<string, number>)
        })
    }

    private applyDamage(args: AttackResolutionArgs) {
        const targetIds = (args.gmTargetsOnly ? getTargetIds() : this.targetIds ?? []).filter(id => this.shouldApplyDamageToTarget(id))
        targetIds.forEach(id => {
            const actor = canvas?.scene?.tokens?.get(id)?.actor
            const adjDamage = this.calculateAdjustedDamage(id, args)
            this.updateHP(actor?.system, this.getHP(actor?.system) - adjDamage)
        })
    }

    protected shouldApplyDamageToTarget(targetId: string): boolean {
        const actor = canvas?.scene?.tokens?.get(targetId)?.actor
        const immunities = (actor?.system as any)?.modifiers?.damage?.in?.immunities ?? []
        if (immunities.includes(this.damageRoll?.dmgType ?? '')) return false
        return true
    }

    protected calculateAdjustedDamage(targetId: string, args: AttackResolutionArgs): number {
        const actor = canvas?.scene?.tokens?.get(targetId)?.actor
        const aSys = actor?.system as any

        const dmgType = this.damageRoll?.dmgType ?? ''
        const mods = aSys?.modifiers?.damage?.in ?? {}
        const perDieMitigation = (mods?.perDieReduction?.global ?? 0) + (mods?.perDieReduction?.[dmgType] ?? 0)
        const damageDiceCount = this.damageRoll?.result?.rollSummaries?.filter(it => !it.rerolled).length ?? 0
        const isResistant = mods?.resistances?.includes(dmgType)
        const perDieMit = perDieMitigation * damageDiceCount

        const damage = isResistant ? Math.floor((this.damageRoll?.result?.total ?? 0) / 2) : this.damageRoll?.result?.total ?? 0
        const target = actor?.system

        const armorRating = (target as any)?.armor?.rating ?? 0
        const armorPiercing = this.damageRoll?.result?.armorPiercing ?? 0
        const armor = args.bypassArmor ? 0 : Math.max(0, armorRating - armorPiercing)
        return Math.max(0, (damage + (args.flanked ? 2 : 0)) - armor - perDieMit)
    }

    protected get isCriticalHit(): boolean { return false }

    private async processStatusFx(args: AttackResolutionArgs) {
        if (this.appliedEffects.length === 0) return

        const targetIds = (args.gmTargetsOnly ? getTargetIds() : this.targetIds ?? []).filter(id => this.shouldApplyDamageToTarget(id))

        for (const id of targetIds) {
            const token = getCanvasToken(id)
            const actor = token?.actor ?? canvas?.scene?.tokens?.get(id)?.actor
            if (!actor) continue

            for (const eff of this.appliedEffects) {
                if (Attack.isImmuneToStatus(actor, eff.effect)) continue

                const duration = (this.isCriticalHit && eff.critDuration) ? eff.critDuration : eff.duration
                await this.applyEffects(actor, token, eff.effect, duration, eff.damageType)
            }
        }
    }

    // Countdown durations (e.g. "Cd6") additionally spawn a Countdown die to track it; the status is always toggled on immediately.
    private async applyEffects(actor: Actor, token: Token | undefined, status: string, duration?: string, damageType?: string) {
        if (!duration || duration === "-") return

        await actor.toggleStatusEffect(status, { active: true })

        const countdownFaces = duration?.match(/^Cd(\d+)$/)?.[1]
        if (countdownFaces) {
            await addCountdown(
                appLang.StatusConditions[status]?.name ?? status,
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

    protected async updateHP(target, hp) {
        if (target) {
            const currentHp = this.getHP(target) ?? 0
            const diff = hp - currentHp
            if (diff !== 0) {
                const actor = target?.parent
                const token = actor ? (actor.getActiveTokens()[0] ?? actor) : null
                showFloatingText(token ?? target, Math.abs(diff), { isHealing: diff > 0 })
            }
            await target?.parent?.update({ "system.health.value": hp })
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