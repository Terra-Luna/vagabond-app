import { roll3dDice } from "../../utils/foundryUtils"
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

    async save(serialize: (attack: Attack) => AttackSnapshot | undefined) {
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

    get showTargets(): boolean {
        return !!this.targetIds?.length
    }

    get showDamage(): boolean {
        return !!this.damageRollResult?.total
    }

    async rollDamage() {
        if (this.damageRoll && this.damageRoll.dice.length > 0 && !this.damageRollResult) {
            this.damageRollResult = await this.damageRoll.roll()
            console.log("Rolling damage...", this.damageRollResult)
            roll3dDice(this.damageRollResult?.rolls ?? [])
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

}