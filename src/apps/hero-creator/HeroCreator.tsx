import { useEffect, useMemo } from "react"
import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { useNavigationContext } from "../../view/context/EditModeContext/Hooks"
import { useClassSelection } from "./step/ClassSelection"
import { useNameAndAncestry } from "./step/NameAndAncestry"
import { useCoreStats } from "./step/CoreStats"
import { useTrainingSelection } from "./step/TrainingSelection"
import { useSpellSelection } from "./step/SpellSelection"
import { usePerkSelection } from "./step/PerkSelection"
import { useEquipmentSelection } from "./step/EquipmentSelection"

export const HeroCreator = ({ hero }: { hero: Actor & { system: HeroDataModel } }) => {
    const { stepId, registerStepIds, registerOnFinish } = useNavigationContext()
    const { NameAndAncestry, ancestryItem } = useNameAndAncestry(hero)
    const { ClassSelection, classItem } = useClassSelection(hero)
    const { CoreStats, assignedStats, bonusStatSelections, flatStatBonuses } = useCoreStats(ancestryItem, classItem)
    const { TrainingSelection, classTrainingRules, ancestryTrainingRules, chosenClassSKills, chosenBonusSkills } = useTrainingSelection(ancestryItem, classItem)
    const { SpellSelection, ancestrySpellSlots, classSpellSlots } = useSpellSelection(ancestryItem, classItem)
    const { PerkSelection } = usePerkSelection(ancestryItem, classItem)
    const { EquipmentSelection } = useEquipmentSelection(classItem)

    const getStatsWithBonuses = (assignedStats: any[], bonusStatSelections: any[], flatStatBonuses: any[]): { stat: string, value: number }[] => {
        const stats: { stat: string, value: number }[] = []
        assignedStats.forEach(assignedStat => {
            const bonus = [...bonusStatSelections, ...flatStatBonuses]
                .filter(b => b.stat.replace("stats.", "") === assignedStat.stat)
                .reduce((sum, it) => { return sum + it.bonus }, 0)
            stats.push({ stat: assignedStat.stat, value: (assignedStat.value + bonus) })
        })
        return stats
    }

    const hasSpellSlots = [...ancestrySpellSlots, ...classSpellSlots].length > 0

    const activeSteps = useMemo(() => {
        const baseSteps = [
            { id: 'identity', view: <NameAndAncestry /> },
            { id: 'class-selection', view: <ClassSelection /> },
            { id: 'core-stats', view: <CoreStats /> },
            { id: 'training-selection', view: <TrainingSelection stats={getStatsWithBonuses(assignedStats, bonusStatSelections, flatStatBonuses)} /> },
            { id: 'perk-selection', view: <PerkSelection /> },
            { id: 'equipment-selection', view: <EquipmentSelection /> }
        ]

        if (!hasSpellSlots) return baseSteps

        const targetIndex = baseSteps.findIndex(s => s.id === 'training-selection') + 1
        return [
            ...baseSteps.slice(0, targetIndex),
            { id: 'spell-selection', view: <SpellSelection /> },
            ...baseSteps.slice(targetIndex)
        ]

    }, [hasSpellSlots, assignedStats, bonusStatSelections, flatStatBonuses, NameAndAncestry, ClassSelection, CoreStats, TrainingSelection, SpellSelection, PerkSelection, EquipmentSelection])

    const stepIdsString = JSON.stringify(activeSteps.map(s => s.id))

    useEffect(() => {
        registerStepIds(JSON.parse(stepIdsString))
    }, [stepIdsString, registerStepIds])

    useEffect(() => {
        registerOnFinish(() => {
            console.log("TODO: apply selections to hero and close.")
            /**
             * 1. Create embedded documents for ancestry & class.
             * 2. Iterate over their ChoiceSet rules and push a property, 'selections' onto them
             *    as an array of they player's choice selections.
             * 3. Add a handler for ChoiceSet.selections in HeroDataModel's updateActor().
             * 4. Item grants and stat modifiers will be applied automatically.
             */
        })
    }, [registerOnFinish])

    return (
        <div className="text-text-primary text-lg font-eskapade p-2 overflow-auto">
            {activeSteps.find(s => s.id === stepId)?.view}
        </div>
    )
}