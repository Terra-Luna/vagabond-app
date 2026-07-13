import { useState, useMemo, useRef, useEffect } from "react"
import { AncestryDataModel } from "../../../../../../model/item/character/AncestryDataModel"
import { ClassDataModel } from "../../../../../../model/item/character/ClassDataModel"
import { vgLiteLang } from "../../../../../../utils/lang"
import { Header } from "../../../../../component/Header"
import { useNavButtons } from "../../../../../context/navigation/NavButtons"
import { HeroCreationSubtext } from "../component/HeroCreationTypography"
import { getRequiredSkillTrainingRules, getSkillTrainingChoiceRules } from "../../../../../component/rules/util/item-rules-util"

export const useTrainingSelection = (ancestry: Item & { system: AncestryDataModel } | undefined, clazz: Item & { system: ClassDataModel } | undefined) => {
    const strings = vgLiteLang.HeroCreation
    const { NavButtons, setCanProceed } = useNavButtons()
    const canProceedRef = useRef<boolean>(false)
    const [assignedTrainings, setAssignedTrainings] = useState<{ stat: string, name: string, bonus: number }[]>([])

    const skillTrainingChoiceRules = useMemo(() => {
        return getSkillTrainingChoiceRules([ancestry, clazz])
    }, [ancestry, clazz])

    const requiredSkillTrainings = useMemo(() => {
        return getRequiredSkillTrainingRules([ancestry, clazz])
    }, [ancestry, clazz])

    /**
     * Monitors the selected trainings to allow the player to proceed to the next step.
     */
    useEffect(() => {
        let shouldProceed = false
        const totalSkillChoices = skillTrainingChoiceRules.reduce((sum, r) => sum + (r.maxChoices || 1), 0)
        if (totalSkillChoices > 0 && assignedTrainings.length === totalSkillChoices) {
            shouldProceed = true
        }
        else if (totalSkillChoices === 0) {
            shouldProceed = true
        }
        if (canProceedRef.current !== shouldProceed) {
            canProceedRef.current = shouldProceed
            setCanProceed(shouldProceed)
        }
    }, [assignedTrainings, skillTrainingChoiceRules])

    const TrainingSelection = () => {
        return (
            <div className="bg-sheet-main-fill space-y-4">
                {/* HEADER AND NAVIGATION BUTTONS */}
                <NavButtons header={<Header title={strings.traingingsHeader} />} />

                <div className="items-center justify-center text-center w-full space-y-2">
                    <HeroCreationSubtext text={strings.trainingSubheader} />
                    
                </div>
            </div>
        )
    }

    return { TrainingSelection }
}