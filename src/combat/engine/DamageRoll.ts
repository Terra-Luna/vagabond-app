import { EmptyObject } from "@league-of-foundry-developers/foundry-vtt-types/utils"
import { DiceRoll, RollSummary, buildRollSummary, getDiceTerms, getResults, toRollFormula } from "./util/dice-utils"

export interface DamageRollArgs {
    atkName: string
    dice: DiceRoll[]
    dmgType?: string
    flatDmgBonus?: number
    perDieDmgBonus?: number
}

export interface DamageRollResult {
    atkName: string
    dmgType: string
    bonus: number
    total: number
    rollsSummary: RollSummary[]
    rolls: any[]
}

export class DamageRoll {
    atkName: string
    dmgType: string
    dice: DiceRoll[]
    flatDmgBonus: number
    perDieDmgBonus: number
    result: DamageRollResult | undefined

    constructor(args: DamageRollArgs) {
        this.atkName = args.atkName
        this.dice = args.dice
        this.dmgType = args.dmgType ?? 'physical'
        this.flatDmgBonus = args.flatDmgBonus ?? 0
        this.perDieDmgBonus = args.perDieDmgBonus ?? 0
    }

    public async roll(): Promise<DamageRollResult> {
        const dice = this.dice.map(d => toRollFormula(d)).join("+")
        const damageRoll = await new Roll(`${dice}+${this.flatDmgBonus ?? 0}`).evaluate()
        const damageRollTerms = getDiceTerms(damageRoll)
        const explosions: Roll.Evaluated<Roll<EmptyObject>>[] = []

        let canExplode = false
        this.dice.filter(d => d.explodesOn && d.explodesOn.length > 0).forEach(async d => {
            if (this.isSafeToExplode(d.faces, d.explodesOn!)) {
                canExplode = true
                await this.processExplosions(
                    damageRollTerms.filter(t => t.faces === d.faces),
                    explosions,
                    d.explodesOn!
                )
            }
        })

        const combinedExplosions = canExplode ? this.mergeExplosions(explosions) : null
        const explosionTerms = canExplode ? getDiceTerms(combinedExplosions!) : []
        const totalDice = getResults(damageRoll)?.length + (canExplode ? (getResults(combinedExplosions!)?.length ?? 0) : 0)
        const perDieBonus = totalDice * (this.perDieDmgBonus ?? 0)
        const totalBonus = perDieBonus + this.getFlatDamageBonus(damageRoll)

        const result = {
            atkName: this.atkName,
            dmgType: this.dmgType,
            total: damageRoll.total + (combinedExplosions?.total ?? 0) + perDieBonus,
            bonus: totalBonus,
            rollsSummary: buildRollSummary(damageRollTerms, explosionTerms, this.dice),
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
        let count = 0
        damageRollTerms.forEach(term => {
            term.results.forEach(r => {
                if (explodesOn.indexOf(r.result) > -1) {
                    count += 1
                }
            })
        })
    
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
     * This is complicated, yet the most reliable way to get the flat damage bonus.
     * On a formula such as: 1d20+5-1d4, simply subtracting the total from the dice
     * total won't account for the d4 subtraction. Alternatively, if a negative bonus
     * would take the roll's total below 0, other bugs occur.
     * @param roll
     * @returns 
     */
    private getFlatDamageBonus(roll: Roll.Evaluated<Roll<EmptyObject>>): number {
        let bonus = 0
        roll.terms.forEach((term, i) => {
            if (i === 0 && this.isNumericTerm(term)) {
                const nextTerm = roll.terms[i + 1]
                if (this.isOperatorTerm(nextTerm)) {
                    bonus += this.performOperatorCalc(this.asOperator(nextTerm), this.asNumeric(term))
                }
            }
            else if (this.isNumericTerm(term) && this.isOperatorTerm(roll.terms[i - 1])) {
                bonus += this.performOperatorCalc(this.asOperator(roll.terms[i - 1]), this.asNumeric(term))
            }
        })
        return bonus
    }

    private performOperatorCalc(operator: foundry.dice.terms.OperatorTerm, numericTerm: foundry.dice.terms.NumericTerm): number {
        return (operator.operator === '+') ? numericTerm.number : -numericTerm.number
    }
    
    private isNumericTerm = (term: any): boolean => {
        return term instanceof foundry.dice.terms.NumericTerm
    }
    
    private asNumeric = (term: any): foundry.dice.terms.NumericTerm => {
        return term as foundry.dice.terms.NumericTerm
    }
    
    private isOperatorTerm = (term: any): boolean => {
        return term instanceof foundry.dice.terms.OperatorTerm
    }
    
    private asOperator = (term: any): foundry.dice.terms.OperatorTerm => {
        return term as foundry.dice.terms.OperatorTerm
    }

}