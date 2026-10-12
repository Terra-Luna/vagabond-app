import { useCallback, useState } from "react";

import { SkillCheckResult } from "../../combat/engine/roll/SkillCheck";
import { HeroDataModel } from "../../model/actor/HeroDataModel";
import { VagabondAppError } from "../../model/common/VagabondAppError";
import { localizeString } from "../../utils/localeUtils";
import { EnrichedContent } from "./EnrichedContent";

export const DiceRollEnrichedText = ({ actor, content, setRollResult }: { actor: { system: HeroDataModel }, content: string, setRollResult?: (result: Roll | SkillCheckResult) => void }) => {
    const [dieRollResult, setDieRollResult] = useState<Roll>()

    const setRollResultInternal = useCallback((result) => {
        setRollResult?.(result)
        if (result instanceof Roll) {
            setDieRollResult(result)
        }
    }, [setRollResult])

    // find all {{diceRoll.d#}} instances
    const processRegexp = content.matchAll(/{{diceRoll\.d(\d+?)}}/g)
    const varsFound = new Set<string>()
    for (const match of processRegexp) {
        const [_, capture] = match // "capture" like regex capture group
        varsFound.add(capture)
    }

    const dieToRoll = varsFound.first()
    if (!dieToRoll) {
        throw new VagabondAppError({ name: 'NO_DIE_ROLL_FOUND', message: 'Could not find a die roll in the string' })
    }

    if (varsFound.size > 1) {
        throw new VagabondAppError({ name: 'TOO_MANY_DICE_ROLLS', message: 'Can only enrich one dice roll at a time' })
    }
    
    const argToUse = `diceRoll.d${dieToRoll}`
    const dieText = `d${dieToRoll}`
    const localeArgs = {}

    if (dieRollResult) {
        localeArgs[argToUse] = dieRollResult.result
    } else {
        localeArgs[argToUse] = `[[/r d${dieToRoll}]]{${dieText}}`
    }

    return <EnrichedContent actor={actor as any} content={localizeString(content, localeArgs)} setRollResult={setRollResultInternal} />
}