import { EmptyObject } from "@league-of-foundry-developers/foundry-vtt-types/utils"

import { getDiceTerms, getResults } from "../util/dice-utils"
import { DiceRoll } from "./DiceRoll"
import { RollSummary } from "./RollSummary"

export interface DamageRollArgs {
    atkName: string
    dice: DiceRoll[]
    dmgType?: string
    flatDmgBonus?: number
    perDieDmgBonus?: number
    armorPiercing?: number
}

export interface DamageRollResult {
    atkName: string
    dmgType: string
    bonus: number
    total: number
    rollSummaries: RollSummary[]
    rolls: Roll.Evaluated<Roll<EmptyObject>>[]
}

export class DamageRoll {
    atkName: string
    dmgType: string
    dice: DiceRoll[]
    flatDmgBonus: number
    perDieDmgBonus: number
    armorPiercing: number
    result: DamageRollResult | undefined

    constructor(args: DamageRollArgs) {
        this.atkName = args.atkName
        this.dice = args.dice
        this.dmgType = args.dmgType ?? 'physical'
        this.flatDmgBonus = args.flatDmgBonus ?? 0
        this.perDieDmgBonus = args.perDieDmgBonus ?? 0
        this.armorPiercing = args.armorPiercing ?? 0
    }

    toString(): string {
        return this.dice.map(d => {
            let formula = `${d.count}d${d.faces}`
            if (d.explodesOn && d.explodesOn.length > 0) formula += `!`
            if (d.modifier) formula += `+${d.modifier}`
            return formula
        }).join('+')
    }

    toJson() {
        return {
            atkName: this.atkName,
            dice: this.dice,
            dmgType: this.dmgType,
            flatDmgBonus: this.flatDmgBonus,
            perDieDmgBonus: this.perDieDmgBonus,
            armorPiercing: this.armorPiercing,
            result: this.result
        }
    }

    static fromJson(json): DamageRoll | undefined {
        if (!json) return undefined
        try {
            const roll = new DamageRoll({
                atkName: json.atkName,
                dice: json.dice,
                dmgType: json.dmgType,
                flatDmgBonus: json.flatDmgBonus,
                perDieDmgBonus: json.perDieDmgBonus,
                armorPiercing: json.armorPiercing
            })
            roll.result = json.result
            return roll
        }
        catch (error) {
            console.error(error)
            return undefined
        }
    }

    async roll(isCrit?: boolean): Promise<DamageRollResult> {
        const straightRolls = this.dice.filter(d => !d.explodesOn || d.explodesOn.length === 0)
        const explodableRolls = this.dice.filter(d => d.explodesOn && d.explodesOn.length > 0)

        const damageRoll = await new Roll(`${straightRolls.map(d => new DiceRoll(d).toRollFormula(isCrit)).join("+")}+${this.flatDmgBonus ?? 0}`).evaluate()
        const damageRollTerms = getDiceTerms(damageRoll)

        let initialExplodableRoll: Roll.Evaluated<Roll<EmptyObject>> = await new Roll(`0`).evaluate()
        let initialExplodableTerms: foundry.dice.terms.DiceTerm[] = []

        if (explodableRolls && explodableRolls.length > 0) {
            let formula = `${explodableRolls.map(d => new DiceRoll(d).toRollFormula(isCrit)).join("+")}`
            if (straightRolls.length === 0) {
                formula += `+${this.flatDmgBonus ?? 0}`
            }
            initialExplodableRoll = await new Roll(formula).evaluate()
            initialExplodableTerms = getDiceTerms(initialExplodableRoll)
        }

        const explosions: Roll.Evaluated<Roll<EmptyObject>>[] = []

        let canExplode = false
        for (const d of this.dice.filter(d => d.explodesOn && d.explodesOn.length > 0 && (isCrit && d.explodeOnCritOnly || !d.explodeOnCritOnly))) {
            if (this.isSafeToExplode(d.faces, d.explodesOn!)) {
                canExplode = true
                await this.processExplosions(initialExplodableTerms, explosions, d.explodesOn ?? [])
            }
        }

        const combinedExplosions = canExplode ? this.mergeExplosions([...explosions]) : null
        const explosionTerms = canExplode ? getDiceTerms(combinedExplosions!) : []
        const totalDice = getResults(damageRoll)?.length + (canExplode ? (getResults(combinedExplosions!)?.length ?? 0) : 0)
        const perDieBonus = totalDice * (this.perDieDmgBonus ?? 0)
        const totalBonus = perDieBonus + this.getFlatDamageBonus(damageRoll, initialExplodableRoll)

        const result = {
            atkName: this.atkName,
            dmgType: this.dmgType,
            total: damageRoll.total + initialExplodableRoll.total + (combinedExplosions?.total ?? 0) + perDieBonus,
            bonus: totalBonus,
            rollSummaries: RollSummary.buildRollSummaries(damageRollTerms, initialExplodableTerms, explosionTerms, this.dice),
            rolls: [damageRoll]
        } as DamageRollResult

        result.rolls = [damageRoll]

        if (canExplode && combinedExplosions) result.rolls.push(combinedExplosions)

        this.result = result
        return result
    }

    /**
     * Recursive function to compound exploding dice into
     * the given 'explosions' parameter.
     * @param damageRollTerms
     * @param explosions 
     * @param explodesOn 
     */
    private async processExplosions(
        damageRollTerms: foundry.dice.terms.DiceTerm[],
        explosions: Roll.Evaluated<Roll>[],
        explodesOn: number[]
    ) {
        const count = damageRollTerms
            .flatMap(it => it.results)
            .filter(it => explodesOn.includes(it.result))
            .length
    
        if (count > 0) {
            const explosionRoll = await new Roll(`${count}d${damageRollTerms[0].faces}`).evaluate()
            explosions.push(explosionRoll)
            await this.processExplosions(getDiceTerms(explosionRoll), explosions, explodesOn)
        }
    }
    
    private mergeExplosions(explosions: Roll.Evaluated<Roll<EmptyObject>>[]): Roll.Evaluated<Roll> | null {
        const combinedExplosionTerms = explosions.reduce<foundry.dice.terms.RollTerm[]>((sum, current, index) => {
            if (index > 0) {
                sum.push(new foundry.dice.terms.OperatorTerm({ operator: "+" }))
            }
            return sum.concat(current?.terms)
        }, [])

        if (combinedExplosionTerms?.length === 0) return null
        const combinedExplosions = Roll.fromTerms(combinedExplosionTerms)
        combinedExplosions["_evaluated"] = true
        combinedExplosions["_total"] = (combinedExplosions as any)._evaluateTotal()
        return combinedExplosions as Roll.Evaluated<Roll>
    }
    
    /**
     * Used to prevent infinitely exploding dice.
     * @param formula 
     * @param explodesOn 
     * @returns 
     */
    private isSafeToExplode(faces: number | undefined, explodesOn: number[]): boolean {
        for (let i = 1; i <= (faces ?? 0); i++) {
            if (explodesOn.indexOf(i) === -1) {
                return true
            }
        }
        return false
    }

    /**
     * Helper function to extract the sum total of flat bonuses applied to a roll.
     * @param roll
     * @returns 
     */
    private getFlatDamageBonus(roll: Roll.Evaluated<Roll<EmptyObject>>, initialExplodableRoll: Roll.Evaluated<Roll<EmptyObject>>): number {
        const terms = Array.from([roll, initialExplodableRoll]).flatMap(it => it.terms).filter(it => this.isNumericTerm(it) || this.isOperatorTerm(it))
        let bonus = 0

        terms.forEach((term, i) => {
            if (i > 0 && this.isNumericTerm(term) && this.isOperatorTerm(terms[i - 1])) {
                const operator = (terms[i - 1] as any).operator
                const value = (term as any).number
                bonus += operator === '+' ? value : operator === '-' ? -value : 0
            }
        })

        return bonus
    }
    
    private isNumericTerm = (term: any): boolean => {
        return term instanceof foundry.dice.terms.NumericTerm
    }

    private isOperatorTerm = (term: any): boolean => {
        return term instanceof foundry.dice.terms.OperatorTerm
    }

}