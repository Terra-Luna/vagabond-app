/**
 * Rolls a skill check and posts the results to chat.
 * Returns a SkillCheckResult enum value.
 */
export const skillCheck = async (
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

export enum FavorHinder {
    None, Favored, Hindered
}

export enum SkillCheckResult {
    Crit, Success, Failure
}