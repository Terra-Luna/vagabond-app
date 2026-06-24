import WeaponDataModel, { gripStateDamage } from "../model/item/equip/WeaponDataModel"

/**
 * Rolls a skill check and posts the results to chat.
 * Returns a SkillCheckResult enum value.
 */
export enum FavorHinder {
    None, Favored, Hindered
}
export enum CritSuccessFail {
    Crit = "CRIT",
    Success = "SUCCESS",
    Fail = "FAILURE"
}
export interface SkillCheckResult {
    skillName: string,
    difficulty: number,
    favorHinder: FavorHinder,
    d20: number,
    d6: number,
    total: number,
    result: CritSuccessFail
}
export const rollSkillCheck = async (
    skillName: string,
    difficulty: number,
    clickEvent: React.MouseEvent<HTMLDivElement>,
    favorHinder: FavorHinder = FavorHinder.None,
    critsOn: number = 20
): Promise<SkillCheckResult> => {
    /**
     * Override favorHinder with shift/ctrl key hold.
     */
    if (clickEvent.shiftKey) {
        favorHinder = FavorHinder.Favored
    }
    else if (clickEvent.ctrlKey) {
        favorHinder = FavorHinder.Hindered
    }

    /**
     * Build roll formula and evaluate.
     */
    let formula = `1d20`
    favorHinder === FavorHinder.Favored ? formula += `+1d6` : (favorHinder === FavorHinder.Hindered ? formula += `-1d6` : {})
    const roll = await new Roll(formula).evaluate()

    /**
     * Extract roll results...
     */
    const isSuccess = roll.total >= difficulty
    const terms = roll.terms.filter((term): term is foundry.dice.terms.DiceTerm => term instanceof foundry.dice.terms.DiceTerm)
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
        result: isCrit ? CritSuccessFail.Crit : (isSuccess ? CritSuccessFail.Success : CritSuccessFail.Fail)
    }
}

/**
 * Basic class to help organize damage roll results. Marks
 * exploded rolls with an asterisk.
 */
class DamageRollResult {
    formula: string = ''
    total: number = 0
    bonus: number = 0
    rolls: { result: number, dieSize: number, exploded: boolean }[] = []
    display = (): string => {
        let d = `${this.printRollInfo()}`
        d += this.bonus > 0 ? ` + ${this.bonus}` : ''
        d += ` = <b>${this.total}</b>`
        return d
    }
    printRollInfo = (): string => {
        const info = this.rolls.reduce((summary, it) => {
            return summary + `[${it.result}]${it.exploded ? '*' : ''} `
        }, '')
        return info.substring(0, info.length - 1)
    }
}

/**
 * Rolls damage! dmgFormula: e.g.: '6d10'
 * Foundry's formulae for exploding dice don't allow for true recursions.
 * Therefore, we need our own functions for handling it. They also don't
 * support the concept of adding a bonus based on the total number of dice
 * rolled.
 */
export const rollWeaponDamage = async (
    actor: Actor,
    weapon: WeaponDataModel
): Promise<DamageRollResult> => {
    return rollDamage(actor, gripStateDamage(weapon))
}

export const rollDamage = async (
    actor: Actor,
    dmgFormula: string,
    bonusDieFormula: string = '0',
    flatDmgBonus: number = 0,
    perDieDmgBonus: number = 0,
    canExplode: boolean = false,
    explodesOn: number[] = []
): Promise<DamageRollResult> => {
    const damageRoll = await new Roll(dmgFormula).evaluate()
    const bonusDamageRoll = await new Roll(bonusDieFormula).evaluate()
    const explosions: Roll.Evaluated<Roll>[] = []

    if (canExplode) {
        if (isSafeToExplode(dmgFormula, explodesOn)) {
            if (explodesOn.length < 1) {
                // Default: explode on max val if not otherwise specified.
                explodesOn.push(damageRoll.dice[0].faces as number)
            }
            await processExplosions(damageRoll, explosions, explodesOn)
        }
        else {
            canExplode = false
            explodesOn = []
        }
    }

    const totalDice =
        getResults(damageRoll).length +
        getResults(bonusDamageRoll).length +
        explosions.reduce((total, roll) => {
            return total + getResults(roll).length
        }, 0)

    const result = new DamageRollResult()
    result.formula = `[${dmgFormula}]${canExplode ? '!' : ''}`
    result.formula += bonusDieFormula !== '0' ? `+[${bonusDieFormula}]` : ''
    result.formula += flatDmgBonus > 0 ? `+${flatDmgBonus}` : ''
    result.formula += perDieDmgBonus > 0 ? ` +${perDieDmgBonus}/die` : ''
    result.bonus = (totalDice * perDieDmgBonus) + flatDmgBonus
    result.total =
        damageRoll.total + bonusDamageRoll.total +
        explosions.reduce((total, roll) => { return total + roll.total }, 0) +
        result.bonus
    getResults(damageRoll).forEach(r => {
        result.rolls.push({
            result: r.result,
            dieSize: damageRoll.dice[0].faces as number,
            exploded: explodesOn.indexOf(r.result) > -1
        })
    })
    explosions.forEach(ex => {
        getResults(ex).forEach(r => {
            result.rolls.push({
                result: r.result,
                dieSize: damageRoll.dice[0].faces as number,
                exploded: explodesOn.indexOf(r.result) > -1
            })
        })
    })
    getResults(bonusDamageRoll).forEach(r => {
        result.rolls.push({
            result: r.result,
            dieSize: bonusDamageRoll.dice[0].faces as number,
            exploded: false
        })
    })

    /**
     * TODO: build the contents of DamageRollCard.tsx and apply them here.
     */
    ChatMessage.create({
        speaker: { actor: actor.id, alias: actor.name },
        content: `<h3>Damage Roll:</h3><h5>${result.formula}</h5><p>${result.display()}</p>`,
        rolls: [damageRoll, bonusDamageRoll, ...explosions]
    })

    return result
}

/**
 * Recursive function to compound exploding dice into
 * the given 'explosions' parameter.
 * @param damageRoll
 * @param explosions 
 * @param explodesOn 
 */
async function processExplosions(
    damageRoll: Roll.Evaluated<Roll>,
    explosions: Roll.Evaluated<Roll>[],
    explodesOn: number[]
) {
    let count = 0
    getResults(damageRoll).forEach(r => {
        if (explodesOn.indexOf(r.result) > -1) {
            count += 1
        }
    })

    if (count > 0) {
        const explosionRoll = await new Roll(`${count}d${getFaces(damageRoll)}`).evaluate()
        explosions.push(explosionRoll)
        await processExplosions(explosionRoll, explosions, explodesOn)
    }
}

/**
 * Used to prevent infinitely exploding dice.
 * @param formula 
 * @param explodesOn 
 * @returns 
 */
function isSafeToExplode(formula: string, explodesOn: number[]): boolean {
    const dieSize = Number(formula.split('d')[1])
    //console.log("Checking explosion safety:", formula, explodesOn)
    for (let i = 1; i <= dieSize; i++) {
        if (explodesOn.indexOf(i) === -1) {
            return true
        }
    }
    //console.log("Unsafe explosions detected!", formula, explodesOn)
    return false
}

/**
 * Helper function to wrap the roll results in something easier to work with.
 * @param roll 
 * @returns 
 */
function getResults(roll: Roll.Evaluated<Roll>): { result: number }[] {
    const results = (roll.terms[0] as unknown as { results: [{ result: number }] }).results
    return results !== undefined ? results : []
}

/**
 * Returns die size for the given roll's first dice - should be
 * reliable since we won't be doing rolls of mixed die sizes.
 * @param roll 
 * @returns 
 */
function getFaces(roll: Roll.Evaluated<Roll>): number {
    return roll.dice[0].faces as number
}