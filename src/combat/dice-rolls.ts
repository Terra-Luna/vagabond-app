import { EmptyObject } from "@league-of-foundry-developers/foundry-vtt-types/utils"
import WeaponDataModel, { gripStateDamage } from "../model/item/equip/WeaponDataModel"
import { getName } from "../utils/modelUtil"
import { lang } from "../utils/lang"

export interface SkillCheckResult {
    skillName: string,
    difficulty: number,
    favorHinder: string,
    d20: number,
    d6: number,
    total: number,
    result: string,
    rolls: any[]
}
export const rollSkillCheck = async (
    skillName: string,
    difficulty: number,
    clickEvent: React.MouseEvent<HTMLDivElement>,
    favorHinder: string = lang.VGLITE.FavorHinder.none,
    critsOn: number = 20
): Promise<SkillCheckResult> => {
    /**
     * Override favorHinder with shift/ctrl key hold.
     */
    if (clickEvent.shiftKey) {
        favorHinder = lang.VGLITE.FavorHinder.favor
    }
    else if (clickEvent.ctrlKey) {
        favorHinder = lang.VGLITE.FavorHinder.hinder
    }

    /**
     * Build roll formula and evaluate.
     */
    let formula = `1d20`
    favorHinder === lang.VGLITE.FavorHinder.favor ? formula += `+1d6` : (favorHinder === lang.VGLITE.FavorHinder.hinder ? formula += `-1d6` : {})
    const roll = await new Roll(formula).evaluate()

    /**
     * Extract roll results...
     */
    const isSuccess = roll.total >= difficulty
    const terms = getDiceTerms(roll)
    const d20Term = terms.find(it => it.faces === 20)
    const d6Term = terms.find(it => it.faces === 6)
    const d20Res = d20Term?.results.find(r => r.active)?.result ?? 0
    const d6Res = d6Term?.results?.find(r => r.active)?.result ?? 0
    const isCrit = d20Res >= critsOn

    return {
        skillName: skillName,
        difficulty: difficulty,
        favorHinder: favorHinder,
        d20: d20Res,
        d6: d6Res,
        total: roll.total,
        result: isCrit ? lang.VGLITE.RollResult.crit : (isSuccess ? lang.VGLITE.RollResult.success : lang.VGLITE.RollResult.failure),
        rolls: [roll]
    }
}

/**
 * Basic interface to help organize damage roll results. Marks
 * exploded rolls with an asterisk.
 */
export interface DamageRollResult {
    atkName: string
    dmgType: string
    bonus: number
    total: number
    rollsSummary: { result: number, dieSize: number, exploded: boolean }[]
    rolls: any[]
}

export const rollDamage = async (
    atkName: string,
    dmgType: string,
    dmgFormula: string | number,
    perDieDmgBonus: number = 0,
    canExplode: boolean = false,
    explodesOn: number[] = []
): Promise<DamageRollResult> => {
    const damageRoll = await new Roll(dmgFormula.toString()).evaluate()
    const damageRollTerms = getDiceTerms(damageRoll)
    const explosions: Roll.Evaluated<Roll<EmptyObject>>[] = []

    if (canExplode) {
        const biggestDieSize = Math.max(...damageRollTerms.map(function (t) { return t.faces ?? 0 }))
        if (isSafeToExplode(biggestDieSize, explodesOn)) {
            if (explodesOn.length < 1) {
                // Default: explode on max val if not otherwise specified.
                explodesOn.push(biggestDieSize)
            }
            await processExplosions(
                damageRollTerms.filter(t => t.faces === biggestDieSize),
                explosions,
                explodesOn
            )
        }
        else {
            canExplode = false
        }
    }

    const combinedExplosions = canExplode ? mergeExplosions(explosions) : null
    const explosionTerms = canExplode ? getDiceTerms(combinedExplosions!) : []
    const totalDice = getResults(damageRoll)?.length + (canExplode ? (getResults(combinedExplosions!)?.length ?? 0) : 0)
    const perDieBonus = totalDice * perDieDmgBonus
    const totalBonus = perDieBonus + getFlatDamageBonus(damageRoll)
    const result = {
        atkName: atkName,
        dmgType: dmgType,
        total: damageRoll.total + (combinedExplosions?.total ?? 0) + perDieBonus,
        bonus: totalBonus,
        rollsSummary: buildRollSummary(damageRollTerms, explosionTerms, explodesOn),
        rolls: [damageRoll]
    } as DamageRollResult
    result.rolls = [damageRoll]
    if (canExplode && combinedExplosions) result.rolls.push(combinedExplosions)
    return result
}

/**
 * Recursive function to compound exploding dice into
 * the given 'explosions' parameter.
 * @param damageRollTerms
 * @param explosions 
 * @param explodesOn 
 */
async function processExplosions(
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
        await processExplosions(getDiceTerms(explosionRoll), explosions, explodesOn)
    }
}

function mergeExplosions(explosions: Roll.Evaluated<Roll<EmptyObject>>[]): Roll.Evaluated<Roll> | null {
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
function isSafeToExplode(faces: number | undefined, explodesOn: number[]): boolean {
    for (let i = 1; i <= (faces ?? 0); i++) {
        if (explodesOn.indexOf(i) === -1) {
            return true
        }
    }
    return false
}

/**
 * Helper function to wrap the roll results in something easier to work with.
 * @param roll 
 * @returns 
 */
function getResults(roll: Roll.Evaluated<Roll>): foundry.dice.terms.DiceTerm.Result[] {
    const terms = getDiceTerms(roll)
    const results = terms?.flatMap(t => t.results)
    return results
}

function getDiceTerms(roll: Roll.Evaluated<Roll<EmptyObject>>): foundry.dice.terms.DiceTerm[] {
    return roll?.terms?.filter((term): term is foundry.dice.terms.DiceTerm => term instanceof foundry.dice.terms.DiceTerm)
}

/**
 * This is complicated, yet the most reliable way to get the flat damage bonus.
 * On a formula such as: 1d20+5-1d4, simply subtracting the total from the dice
 * total won't account for the d4 subtraction. Alternatively, if a negative bonus
 * would take the roll's total below 0, other bugs occur.
 * @param roll
 * @returns 
 */
function getFlatDamageBonus(roll: Roll.Evaluated<Roll<EmptyObject>>): number {
    let bonus = 0
    roll.terms.forEach((term, i) => {
        if (i === 0 && isNumericTerm(term)) {
            const nextTerm = roll.terms[i + 1]
            if (isOperatorTerm(nextTerm)) {
                bonus += performOperatorCalc(asOperator(nextTerm), asNumeric(term))
            }
        }
        else if (isNumericTerm(term) && isOperatorTerm(roll.terms[i - 1])) {
            bonus += performOperatorCalc(asOperator(roll.terms[i - 1]), asNumeric(term))
        }
    })
    return bonus
}

function performOperatorCalc(operator: foundry.dice.terms.OperatorTerm, numericTerm: foundry.dice.terms.NumericTerm): number {
    return (operator.operator === '+') ? numericTerm.number : -numericTerm.number
}

const isNumericTerm = (term: any): boolean => {
    return term instanceof foundry.dice.terms.NumericTerm
}
const asNumeric = (term: any): foundry.dice.terms.NumericTerm => {
    return term as foundry.dice.terms.NumericTerm
}

const isOperatorTerm = (term: any): boolean => {
    return term instanceof foundry.dice.terms.OperatorTerm
}

const asOperator = (term: any): foundry.dice.terms.OperatorTerm => {
    return term as foundry.dice.terms.OperatorTerm
}

function buildRollSummary(
    damageRollTerms: foundry.dice.terms.DiceTerm[],
    explosionTerms: foundry.dice.terms.DiceTerm[] | null,
    explodesOn: number[]
) {
    const summary: { result: number, dieSize: number, exploded: boolean }[] = []
    damageRollTerms.concat(explosionTerms ?? []).forEach(term => {
        term.results.forEach(res => {
            summary.push({
                result: res.result,
                dieSize: term.faces as number,
                exploded: explodesOn.indexOf(res.result) > -1
            })
        })
    })
    return summary
}

/**
 * Rolls damage! dmgFormula: e.g.: '6d10'
 * Foundry's formulae for exploding dice don't allow for true recursions.
 * Therefore, we need our own functions for handling it. They also don't
 * support the concept of adding a bonus based on the total number of dice
 * rolled.
 */
export const rollWeaponDamage = async (weapon: WeaponDataModel): Promise<DamageRollResult> => {
    return rollDamage(
        getName(weapon),
        weapon.damage.type ?? '',
        gripStateDamage(weapon),
        0,
        weapon.explodeData.canExplode,
        weapon.explodeData.explodesOn as number[] ?? []
    )
}