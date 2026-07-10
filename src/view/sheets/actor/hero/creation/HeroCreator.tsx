import { useEffect } from "react"
import { HeroDataModel } from "../../../../../model/actor/HeroDataModel"
import { useNavigationContext } from "../../../../context/EditModeContext/Hooks"
import { useClassSelection } from "./step/ClassSelection"
import { useNameAndAncestry } from "./step/NameAndAncestry"
import { useCoreStats } from "./step/CoreStats"

export const HeroCreator = ({ hero }: { hero: Actor & { system: HeroDataModel } }) => {
    const { stepId, registerStepIds, registerOnFinish } = useNavigationContext()
    const { NameAndAncestry, ancestryItem } = useNameAndAncestry(hero)
    const { ClassSelection, classItem } = useClassSelection(hero)
    const { renderCoreStats, assignedStats } = useCoreStats(hero, classItem?.system)

    const steps = [
        { id: 'identity', view: <NameAndAncestry /> },
        { id: 'class-selection', view: <ClassSelection /> },
        { id: 'core-stats', view: <>{renderCoreStats}</> },
    ]

    useEffect(() => {
        registerStepIds(steps.map(s => s.id))
        registerOnFinish(() => {
            console.log("TODO: figure out how to wrap this up")
        })
    }, [])

    return (
        <div className="text-text-primary text-lg font-eskapade p-2 overflow-auto">
            {steps.find(s => s.id === stepId)?.view}
        </div>
    )

}