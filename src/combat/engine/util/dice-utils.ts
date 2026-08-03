import { EmptyObject } from "@league-of-foundry-developers/foundry-vtt-types/utils"

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