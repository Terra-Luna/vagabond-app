import { DamageRollResult, DamageRoll } from "./DamageRoll"
import { AttackSnapshot } from "./util/attack-serializer"

export abstract class Attack {

    // Unique ID for interacting with the attack in chat card
    id: string = foundry.utils.randomID()
    userId: string = game.userId ?? ''
    abstract actor: Actor
    abstract targetIds?: string[]
    title: string = "Attack"
    damageRoll?: DamageRoll
    damageRollResult?: DamageRollResult
    isResolved: boolean = false

    constructor(title) {
        this.title = title
    }

    abstract steps: string[]
    stepIndex: number = 0
    get step(): string { return this.steps[this.stepIndex] }

    abstract next(): void

    async saveToActor(serialize: (attack: Attack) => AttackSnapshot | undefined) {
        const snapshot = serialize(this)
        if (!snapshot) return

        const currentAttacks = (this.actor.getFlag("vagabond-lite" as any, "attacks") as AttackSnapshot[]) ?? []
        const exists = currentAttacks.some(it => it.id === this.id)

        let updatedAttacks: AttackSnapshot[]

        if (exists) {
            updatedAttacks = currentAttacks.map(it => it.id === this.id ? snapshot : it)
        }
        else {
            updatedAttacks = [...currentAttacks, snapshot]
        }

        await this.actor.setFlag("vagabond-lite" as any, "attacks", updatedAttacks)
    }

    async rollDamage(serialize: (attack: Attack) => AttackSnapshot | undefined) {
        if (this.damageRoll && this.damageRoll.dice.length > 0) {
            this.damageRollResult = await this.damageRoll.roll()
            this.saveToActor(serialize)
        }
    }

    trigger3dDamageRoll() {
        this.damageRollResult?.rolls.forEach(roll => {
            (game as any).dice3d.showForRoll(roll, game.user, true)
        })
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

}