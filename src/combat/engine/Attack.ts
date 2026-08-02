import { roll3dDice } from "../../utils/foundryUtils"
import { DamageRollResult, DamageRoll } from "./DamageRoll"
import { AttackSnapshot } from "./util/attack-serializer"

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

    async rollDamage() {
        if (this.damageRoll && this.damageRoll.dice.length > 0 && !this.damageRoll?.result) {
            await this.damageRoll.roll()
            roll3dDice(this.damageRoll?.result?.rolls ?? [])
        }
    }

    async resolve(serialize: (attack: Attack) => AttackSnapshot | undefined) {
        this.isResolved = true
        await this.save(serialize)
    }

    protected processDamageRoll() {
        if (this.damageRoll?.result) {
            if (this.damageRoll.dmgType === 'healing') {
                this.applyHealing()
            }
            else {
                this.applyDamage()
            }
        }
    }

    private applyHealing() {
        this.getActors(this.targetIds ?? []).forEach(target => {
            this.updateHP(target?.system, this.getHP(target?.system) + (this.damageRoll?.result?.total ?? 0))
        })
    }

    private applyDamage() {
        this.isResolved = true
        this.getActors(this.targetIds ?? []).forEach(actor => {
            const damage = this.damageRoll?.result?.total ?? 0
            const target = actor?.system
            const armor = (target as any)?.armor?.rating ?? 0
            const adjDamage = this.calculateDamage(damage, armor)
            this.updateHP(target, this.getHP(target) - adjDamage)
        })
    }

    private getActors(targetIds: string[]) {
        return targetIds.map(id => canvas?.scene?.tokens?.get(id)?.actor)
    }

    private getHP(target) {
        return target.health.current
    }

    private calculateDamage(damage, armor) {
        return Math.max(0, damage - armor)
    }

    private updateHP(target, hp) {
        target?.parent.update({ "system.health.current": hp })
    }

    async save(serialize: (attack: Attack) => AttackSnapshot | undefined) {
        const snapshot = serialize(this)
        if (!snapshot || !this.actor.id) return

        // IF USER IS GM: Write to the database directly
        if (game.user?.isGM) {
            await Attack.handleIncomingSnapshotRequest({ actorId: this.actor.id, snapshot })
            return
        }
        /**
         * If a player is making the attack, route it thru the socket
         * to the GM's client so it can be saved to world settings.
         */
        console.log("Sending system payload to GM client...", snapshot)
        game.socket?.emit("system.vagabond-lite", {
            request: {
                handler: "system.vagabond-lite",
                action: "saveAttackSnapshot",
                data: { actorId: this.actor.id, snapshot: snapshot }
            },
            broadcast: true
        })
    }

    static async handleIncomingSnapshotRequest(payload: { actorId: string, snapshot: AttackSnapshot }) {
        const { actorId, snapshot } = payload

        const registryRaw = (game.settings as any)?.get("vagabond-lite", "attackRegistry")
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
            updatedAttacks = [...currentAttacks, snapshot]
        }

        attacksRegistry[actorId] = updatedAttacks
        await (game.settings as any)?.set("vagabond-lite", "attackRegistry", attacksRegistry)
    }

}