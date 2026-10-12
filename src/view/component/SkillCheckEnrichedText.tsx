import { useCallback, useState } from "react";

import { SkillCheckResult } from "../../combat/engine/roll/SkillCheck";
import { HeroDataModel } from "../../model/actor/HeroDataModel";
import { VagabondAppError } from "../../model/common/VagabondAppError";
import { lang } from "../../utils/lang";
import { localizeString } from "../../utils/localeUtils";
import { EnrichedContent } from "./EnrichedContent";

export const SkillCheckEnrichedText = ({ actor, content, setRollResult }: { actor: { system: HeroDataModel }, content: string, setRollResult?: (result: Roll | SkillCheckResult) => void }) => {
    const [skillCheckResult, setSkillCheckResult] = useState<SkillCheckResult>()

    const setRollResultInternal = useCallback((result) => {
        setRollResult?.(result)
        if (!(result instanceof Roll)) {
            setSkillCheckResult(result)
        }
    }, [setRollResult])

    // find all {{skillCheck.skill}} instances
    const processRegexp = content.matchAll(/{{(skillCheck\..*?)}}/g)
    const varsFound = new Set<string>()
    for (const match of processRegexp) {
        const [_, capture] = match // "capture" like regex capture group
        varsFound.add(capture)
    }

    const skillCheckText = varsFound.first()
    if (!skillCheckText) {
        throw new VagabondAppError({ name: 'NO_SKILL_CHECK_FOUND', message: 'Could not find a skill check in the string' })
    }

    if (varsFound.size > 1) {
        throw new VagabondAppError({ name: 'TOO_MANY_SKILL_CHECKS', message: 'Can only enrich one skill check at a time' })
    }
    
    // replace {{skillCheck.skill}} with ie "Survival Check"
    const skill = skillCheckText.slice(11)
    const checkTextArgs = { skill: lang.APP.Skills[skill].name }
    const localeArgs = {}

    if (skillCheckResult) {
        checkTextArgs["outcome"] = skillCheckResult.outcome
    }

    const checkText = localizeString(skillCheckResult ? lang.APP.SkillChecks.skillCheckOutcome : lang.APP.SkillChecks.skillCheck, checkTextArgs)

    if (skillCheckResult) {
        localeArgs[skillCheckText] = checkText
    } else {
        localeArgs[skillCheckText] = `[[/r d20#${skillCheckText}]]{${checkText}}`
    }

    return <EnrichedContent actor={actor as any} content={localizeString(content, localeArgs)} setRollResult={setRollResultInternal} />
}