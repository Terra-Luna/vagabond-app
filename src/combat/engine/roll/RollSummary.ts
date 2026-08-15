import { DiceRoll } from "./DiceRoll"

export class RollSummary {

    result: number
    faces: number
    exploded: boolean

    constructor(result: number, faces: number, exploded: boolean) {
        this.result = result
        this.faces = faces
        this.exploded = exploded
    }

    static buildRollSummaries(
        damageRollTerms: foundry.dice.terms.DiceTerm[],
        explosionTerms: foundry.dice.terms.DiceTerm[] | null,
        dice: DiceRoll[],
        isCrit?: boolean
    ) {
        const summary: RollSummary[] = []
        damageRollTerms.concat(explosionTerms ?? []).forEach(term => {
            term.results.forEach(res => {
                summary.push({
                    result: res.result,
                    faces: term.faces as number,
                    exploded: dice
                        .filter(d => d.faces === term.faces && (d.explodeOnCritOnly && isCrit || !d.explodeOnCritOnly))
                        .some(d => d.explodesOn?.includes(res.result))
                })
            })
        })
        return summary
    }

}