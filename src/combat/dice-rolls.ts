import { EmptyObject, HandleEmptyObject } from "@league-of-foundry-developers/foundry-vtt-types/utils"

/**
 * Rolls a skill check and posts the results to chat.
 * Returns a SkillCheckResult enum value.
 */
export enum FavorHinder {
    None, Favored, Hindered
}
export enum SkillCheckResult {
    Crit, Success, Failure
}
export const rollSkillCheck = async (
    actor: Actor,
    skill: string,
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
     * Load the required rolls.
     */
    const rolls = [await new Roll('1d20').evaluate()]
    if (favorHinder != FavorHinder.None) {
        rolls.push(await new Roll('1d6').evaluate())
    }

    /**
     * Process roll results.
     */
    const d20Result = (rolls[0].terms[0] as any).results[0].result
    let favorHinderResult = 0
    let skillCheckTotal = d20Result
    if (rolls.length > 1) {
        favorHinderResult = (rolls[1].terms[0] as any).results[0].result
        favorHinder == FavorHinder.Favored ?
            skillCheckTotal += favorHinderResult :
            skillCheckTotal = Math.max(0, skillCheckTotal - favorHinderResult)
    }

    /**
     * Determine final result as crit, success, or failure.
     */
    const result = d20Result >= critsOn ? SkillCheckResult.Crit : (
        skillCheckTotal >= difficulty ? SkillCheckResult.Success : SkillCheckResult.Failure
    )

    /**
     * Placeholder string builder to send a basic summary to chat.
     */
    const summary = `Result: ${SkillCheckResult[result]}`
    let rollSummary = `${d20Result}`
    if (favorHinder == FavorHinder.Favored) {
        rollSummary += `+${favorHinderResult} (${skillCheckTotal})`
    }
    else if (favorHinder == FavorHinder.Hindered) {
        rollSummary += `-${favorHinderResult} (${skillCheckTotal})`
    }

    /**
     * TODO: build the contents of SkillCheckCard.tsx and apply them here.
     * Is there any reason to handle the chat card outside of the skill check?
     */
    ChatMessage.create({
        speaker: { actor: actor.id, alias: actor.name },
        content: `<h3>${skill} Check</h3><br><p>${rollSummary} vs. ${difficulty}<br>${summary}</p>`,
        rolls: rolls
    })

    return result
}

/**
 * Basic class to help organize damage roll results. Marks
 * exploded rolls with an asterisk.
 */
class DamageRollResult {
    total: number = 0
    bonus: number = 0
    rolls: { result: number, dieSize: number, exploded: boolean }[] = []
    display = (): string => {
        return `${this.printRollInfo()} + ${this.bonus} = ${this.total}`
    }
    printRollInfo = (): string => {
        let info = this.rolls.reduce((summary, it) => {
            return summary + `${it.result}${it.exploded ? '*' : ''}, `
        }, '')
        return info.substring(0, info.length - 2)
    }
}

/**
 * Rolls damage! dmgFormula: e.g.: '6d10'
 */
export const rollDamage = async (
    actor: Actor,
    dmgFormula: string,
    flatDmgBonus: number,
    perDieDmgBonus: number,
    canExplode: boolean = false,
    explodesOn: number[] = []
): Promise<DamageRollResult> => {
    const damageRoll = await new Roll(dmgFormula).evaluate()
    const explosions: Roll.Evaluated<Roll>[] = []

    if (canExplode) {
        if (explodesOn.length < 1) {
            explodesOn.push(damageRoll.dice[0].faces as number)
        }
        await processExplosions(damageRoll, explosions, explodesOn)
    }

    const totalDice =
        damageRoll.terms[0].results.length +
        explosions.reduce((total, roll) => {
            return total + roll.terms[0].results.length
        }, 0)

    const result = new DamageRollResult()
    result.bonus = (totalDice * perDieDmgBonus) + flatDmgBonus
    result.total =
        damageRoll.total +
        explosions.reduce((total, roll) => { return total + roll.total }, 0) +
        result.bonus
    getResults(damageRoll).results.forEach(r => {
        result.rolls.push({
            result: r.result,
            dieSize: damageRoll.dice[0].faces as number,
            exploded: explodesOn.indexOf(r.result) > -1
        })
    })
    explosions.forEach(ex => {
        getResults(ex).results.forEach(r => {
            result.rolls.push({
                result: r.result,
                dieSize: damageRoll.dice[0].faces as number,
                exploded: explodesOn.indexOf(r.result) > -1
            })
        })
    })

    /**
     * TODO: build the contents of DamageRollCard.tsx and apply them here.
     */
    ChatMessage.create({
        speaker: { actor: actor.id, alias: actor.name },
        content: `<h3>Damage Roll:</h3><br><p>${result.display()}</p>`,
        rolls: []
    })

    return result
}

async function processExplosions(
    damageRoll: Roll.Evaluated<Roll>,
    explosions: Roll.Evaluated<Roll>[],
    explodesOn: number[]
) {
    let count = 0
    getResults(damageRoll).results.forEach(r => {
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

function getResults(roll: Roll.Evaluated<Roll>) {
    return (roll.terms[0] as unknown as { results: [{ result: number }] })
}

function getFaces(roll: Roll.Evaluated<Roll>): number {
    return roll.dice[0].faces as number
}