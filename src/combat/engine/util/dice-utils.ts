import { EmptyObject } from "@league-of-foundry-developers/foundry-vtt-types/utils"

export function getDiceTerms(roll: Roll.Evaluated<Roll<EmptyObject>>): foundry.dice.terms.DiceTerm[] {
    return roll?.terms?.filter((term): term is foundry.dice.terms.DiceTerm => term instanceof foundry.dice.terms.DiceTerm)
}

/**
 * Recursively rolls explosions for every die in the given terms that landed on one of
 * `explodesOn`. Each batch of new dice is evaluated as its own roll and returned in order.
 */
export async function rollExplosions(
    rollTerms: foundry.dice.terms.DiceTerm[],
    explodesOn: number[],
    reroll: number[] = []
): Promise<Roll.Evaluated<Roll<EmptyObject>>[]> {
    const count = rollTerms
        .flatMap(it => it.results)
        .filter(it => explodesOn.includes(it.result))
        .length

    if (count === 0) return []

    let formula = `${count}d${rollTerms[0].faces}`
    if (reroll.length > 0) {
        formula += `rr${reroll.join('rr')}`
    }
    const explosionRoll = await new Roll(formula).evaluate()
    return [explosionRoll, ...await rollExplosions(getDiceTerms(explosionRoll), explodesOn, reroll)]
}