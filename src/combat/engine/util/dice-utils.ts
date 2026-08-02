import { EmptyObject } from "@league-of-foundry-developers/foundry-vtt-types/utils"
import { VgLiteError } from "../../../model/common/VgLiteError"

export interface DiceRoll {
    dice: number
    faces: number
    modifier?: number
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

    const diceRegex = /^(\d+)?d(\d+)(!)?((?:[+-]\d+)*)$/;
    const match = cleanFormula.match(diceRegex)

    if (!match) {
        throw new VgLiteError({
            name: "Invalid formula format",
            message: `Invalid formula format: "${formula}". Expected format like "d6", "3d8", "d10!", or "2d6+3-1".`
        })
    }

    const [, diceStr, facesStr, explodeModifier, modifierStr] = match

    const dice = diceStr ? parseInt(diceStr, 10) : 1
    const faces = parseInt(facesStr, 10)
    const explodesOn: number[] = []

    if (explodeModifier === '!') {
        explodesOn.push(faces)
    }

    // Parse and sum up all modifiers
    let modifier = 0
    if (modifierStr) {
        const modifierMatches = modifierStr.match(/[+-]\d+/g)
        if (modifierMatches) {
            for (const mod of modifierMatches) {
                modifier += parseInt(mod, 10)
            }
        }
    }

    return modifier !== 0
        ? { dice, faces, modifier, explodesOn }
        : { dice, faces, explodesOn }
}

/**
 * Explosions are processed using the DiceRoll obj
 * itself so there's no need to mark this with a '!'.
 * @param diceRoll 
 * @returns 
 */
export function toRollFormula(diceRoll: DiceRoll): string {
    const mod = `${diceRoll.modifier ? `+${diceRoll.modifier}` : ''}`

    if (diceRoll.dice > 0)
        return `${diceRoll.dice}d${diceRoll.faces}${mod}`
    else
        return `${diceRoll.faces}${mod}`
}