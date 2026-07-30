import { DamageRollResult, DamageRoll } from "./DamageRoll"
import { DiceRoll } from "./util/dice-utils"

export abstract class Attack {
    /**
     * Override these and set in child constructors.
     */
    protected abstract actor: Actor
    protected abstract targets: Token[] | undefined

    // Damage roll props
    protected attackName: string = ""
    damageDice: DiceRoll[] = []
    flatDamageBonus: number = 0
    perDieDamageBonus: number = 0
    damageType: string | undefined
    effect: string | undefined
    damageRoll: DamageRoll | undefined
    damageRollResult: DamageRollResult | undefined

    public async rollDamage(): Promise<DamageRollResult | undefined> {
        if (this.damageDice.length > 0) {
            this.damageRoll = new DamageRoll({ atkName: this.attackName, dice: this.damageDice, flatDmgBonus: this.flatDamageBonus, perDieDmgBonus: this.perDieDamageBonus })
            this.damageRollResult = await this.damageRoll.roll()
            return this.damageRollResult
        }
        else {
            return undefined
        }
    }

    public apply() {
        if (this.damageRollResult !== undefined) {
            if (this.damageType === 'healing') {
                this.applyHealing()
            }
            else {
                this.applyDamage()
            }
        }
    }

    private applyDamage() {
        this.getActors(this.targets?.map(t => t.id) ?? []).forEach(actor => {
            const damage = this.damageRollResult?.total ?? 0
            const target = actor?.system
            const armor = (target as any)?.armor?.rating ?? 0
            const adjDamage = this.calculateDamage(damage, armor)
            this.updateHP(target, this.getHP(target) - adjDamage)
        })
    }

    private applyHealing() {
        this.getActors(this.targets?.map(t => t.id) ?? []).forEach(target => {
            this.updateHP(target?.system, this.getHP(target?.system) + (this.damageRollResult?.total ?? 0))
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