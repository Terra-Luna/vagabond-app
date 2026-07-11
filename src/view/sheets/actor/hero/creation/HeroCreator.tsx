import { useEffect } from "react"
import { HeroDataModel } from "../../../../../model/actor/HeroDataModel"
import { useNavigationContext } from "../../../../context/EditModeContext/Hooks"
import { useClassSelection } from "./step/ClassSelection"
import { useNameAndAncestry } from "./step/NameAndAncestry"
import { useCoreStats } from "./step/CoreStats"
import { useTrainingSelection } from "./step/TrainingSelection"
import { useSpellSelection } from "./step/SpellSelection"
import { usePerkSelection } from "./step/PerkSelection"
import { useEquipmentSelection } from "./step/EquipmentSelection"

export const HeroCreator = ({ hero }: { hero: Actor & { system: HeroDataModel } }) => {
    const { stepId, registerStepIds, registerOnFinish, onFinishState } = useNavigationContext()
    const { NameAndAncestry, ancestryItem } = useNameAndAncestry(hero)
    const { ClassSelection, classItem } = useClassSelection(hero)
    const { CoreStats, assignedStats, bonusStats } = useCoreStats(ancestryItem?.system, classItem?.system)
    const { TrainingSelection } = useTrainingSelection(ancestryItem?.system, classItem?.system)
    const { SpellSelection } = useSpellSelection(ancestryItem?.system, classItem?.system)
    const { PerkSelection } = usePerkSelection(ancestryItem?.system, classItem?.system)
    const { EquipmentSelection } = useEquipmentSelection(classItem?.system)

    const steps = [
        { id: 'identity', view: <NameAndAncestry /> },
        { id: 'class-selection', view: <ClassSelection /> },
        { id: 'core-stats', view: <CoreStats /> },
        { id: 'training-selection', view: <TrainingSelection /> },
        { id: 'spell-selection', view: <SpellSelection /> },
        { id: 'perk-selection', view: <PerkSelection /> },
        { id: 'equipment-selection', view: <EquipmentSelection /> }
    ]

    useEffect(() => {
        registerStepIds(steps.map(s => s.id))
        registerOnFinish(() => {
            console.log("TODO: apply selections to hero and close.")
        })
    }, [registerOnFinish])

    return (
        <div className="text-text-primary text-lg font-eskapade p-2 overflow-auto">
            {steps.find(s => s.id === stepId)?.view}
        </div>
    )

}