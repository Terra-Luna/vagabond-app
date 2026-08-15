import { getAttackRegistry, setAttackRegistry } from "../../apps/vagabond-tools/VagabondSettingsRegistry"
import { roll3dDice } from "../../utils/foundryUtils"
import { getTargetIds } from "../../utils/modelUtil"
import { DamageRoll } from "./roll/DamageRoll"
import { AttackSnapshot } from "./util/attack-serializer"

export interface AttackResolutionArgs {
    bypassArmor: boolean
    gmTargetsOnly: boolean
}

export abstract class Attack {

    // Unique ID for interacting with the attack in chat card
    id: string = foundry.utils.randomID()
    // User ID for keeping track of who has permission to interact in chat card
    userId: string = game.userId ?? ''

    abstract actor: Actor
    abstract targetIds?: string[]
    title: string = "Attack"
    damageRoll?: DamageRoll
    isResolved: boolean = false

    constructor(title) {
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
        this.processDamageRoll(args)
        this.isResolved = true
        this.save(serialize)
    }

    async resolve(serialize: (attack: Attack) => AttackSnapshot | undefined) {
        this.isResolved = true
        await this.save(serialize)
    }

    protected processDamageRoll(args: AttackResolutionArgs) {
        if (this.damageRoll?.result) {
            if (this.damageRoll.dmgType === 'healing') {
                this.applyHealing(args)
            }
            else {
                this.applyDamage(args)
            }
        }
    }

    private applyHealing(args: AttackResolutionArgs) {
        this.getActors(this.targetIds ?? []).forEach(target => {
            this.updateHP(target?.system, this.getHP(target?.system) + (this.damageRoll?.result?.total ?? 0))
        })
    }

    private applyDamage(args: AttackResolutionArgs) {
        const targetIds = args.gmTargetsOnly ? getTargetIds() : this.targetIds
        this.getActors(targetIds ?? []).forEach(actor => {
            const damage = this.damageRoll?.result?.total ?? 0
            const target = actor?.system
            const armorRating = (target as any)?.armor?.rating ?? 0
            const armorPiercing = this.damageRoll?.armorPiercing ?? 0
            const armor = args.bypassArmor ? 0 : Math.max(0, armorRating - armorPiercing)
            const adjDamage = Math.max(0, damage - armor)
            this.updateHP(target, this.getHP(target) - adjDamage)
        })
    }

    private getActors(targetIds: string[]) {
        return targetIds.map(id => canvas?.scene?.tokens?.get(id)?.actor)
    }

    private getHP(target) {
        return target.health.current
    }

    private updateHP(target, hp) {
        target?.parent.update({ "system.health.current": hp })
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
        game.socket?.emit("system.vagabond-lite", payload)
    }

    static async handleIncomingAttackSnapshot(payload: { actorId: string, snapshot: AttackSnapshot }) {
        const { actorId, snapshot } = payload
        const registryRaw = getAttackRegistry()
        const attacksRegistry = typeof registryRaw === "string" ? JSON.parse(registryRaw) : (registryRaw || {})

        if (!attacksRegistry[actorId]) {
            attacksRegistry[actorId] = []
        }

        const currentAttacks: AttackSnapshot[] = attacksRegistry[actorId]
        const exists = currentAttacks.some(it => it.id === snapshot.id)
        let updatedAttacks: AttackSnapshot[]

        if (exists) {
            updatedAttacks = currentAttacks.map(it => it.id === snapshot.id ? snapshot : it)
        }
        else {
            // Keeps only 50 attacks per player in the database. Adjust as needed.
            updatedAttacks = [...currentAttacks, snapshot].slice(-50)
        }

        attacksRegistry[actorId] = updatedAttacks
        await setAttackRegistry(attacksRegistry)
    }

}