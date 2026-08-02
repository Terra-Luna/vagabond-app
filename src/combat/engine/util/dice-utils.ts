import { EmptyObject } from "@league-of-foundry-developers/foundry-vtt-types/utils"

export interface DiceRoll {
    dice: number
    faces: number
    explodesOn?: number[]
}

export interface RollSummary {
    result: number
    dieSize: number
    exploded: boolean
}

export function buildRollSummary(
    damageRollTerms: foundry.dice.terms.DiceTerm[],
    explosionTerms: foundry.dice.terms.DiceTerm[] | null,
    dice: DiceRoll[]
) {
    const summary: RollSummary[] = []
    damageRollTerms.concat(explosionTerms ?? []).forEach(term => {
        term.results.forEach(res => {
            summary.push({
                result: res.result,
                dieSize: term.faces as number,
                exploded: dice.filter(d => d.faces === term.faces).some(d => d.explodesOn?.includes(res.result))
            })
        })
    })

    console.log(summary)
    return summary
}

/**
 * Helper function to wrap the roll results in something easier to work with.
 * @param roll 
 * @returns 
 */
export function getResults(roll: Roll.Evaluated<Roll>): foundry.dice.terms.DiceTerm.Result[] {
    const terms = getDiceTerms(roll)
    const results = terms?.flatMap(t => t.results)
    return results
}

export function getDiceTerms(roll: Roll.Evaluated<Roll<EmptyObject>>): foundry.dice.terms.DiceTerm[] {
    return roll?.terms?.filter((term): term is foundry.dice.terms.DiceTerm => term instanceof foundry.dice.terms.DiceTerm)
}

/**
 * Converts a typical Foundry roll formula into one of ours. Marking the rolle
 * with a '!' will add its face size as an explodable value.
 * @param formula
 * @returns
 */
export function parseFormulaToDiceRoll(formula: string): DiceRoll {
    const cleanFormula = formula.trim().toLowerCase()

    const diceRegex = /^(\d+)?d(\d+)(!)?$/;
    const match = cleanFormula.match(diceRegex)

    if (!match) {
        throw new Error(`Invalid formula format: "${formula}". Expected format like "3d6", "d8", or "d10!".`)
    }

    const [, diceStr, facesStr, explodeModifier] = match

    const dice = diceStr ? parseInt(diceStr, 10) : 1
    const faces = parseInt(facesStr, 10)
    const explodesOn: number[] = []

    if (explodeModifier === '!') {
        explodesOn.push(faces)
    }

    return { dice, faces, explodesOn }
}

/**
 * Explosions are processed using the DiceRoll obj
 * itselfso there's no need to mark this with a '!'.
 * @param diceRoll 
 * @returns 
 */
export function toRollFormula(diceRoll: DiceRoll): string {
    if (diceRoll.dice > 0)
        return `${diceRoll.dice}d${diceRoll.faces}`
    else
        return `${diceRoll.faces}`
}