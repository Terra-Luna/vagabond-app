import { useCallback, useEffect, useMemo } from "react"
import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { useClassSelection } from "./step/ClassSelection"
import { useNameAndAncestry } from "./step/NameAndAncestry"
import { useCoreStats } from "./step/CoreStats"
import { useTrainingSelection } from "./step/TrainingSelection"
import { useSpellSelection } from "./step/SpellSelection"
import { usePerkSelection } from "./step/PerkSelection"
import { useEquipmentSelection } from "./step/EquipmentSelection"
import { useNavigation } from "../../view/context/navigation/NavigationContext"

interface HeroCreatorProps {
    hero: Actor & { system: HeroDataModel }
    setClosed: () => void
}

export const HeroCreator = ({ hero, setClosed }: HeroCreatorProps) => {
    const { stepId, registerStepIds, registerOnFinish, backButton, nextButton } = useNavigation()

    const { NameAndAncestry, ancestryItem } = useNameAndAncestry(hero, [backButton, nextButton])
    const { ClassSelection, classItem } = useClassSelection(hero, [backButton, nextButton])
    const { CoreStats, selectedArr, assignedStats, bonusStatSelections, flatStatBonuses } = useCoreStats(ancestryItem, classItem, [backButton, nextButton])
    const { TrainingSelection, chosenClassSkills, chosenBonusSkills } = useTrainingSelection(ancestryItem, classItem, [backButton, nextButton])
    const { SpellSelection, ancestrySpellSlots, classSpellSlots } = useSpellSelection(ancestryItem, classItem, [backButton, nextButton])
    const { PerkSelection, ancestryPerkSlots, classPerkSlots } = usePerkSelection(ancestryItem, classItem, [backButton, nextButton])
    const { EquipmentSelection } = useEquipmentSelection(classItem, [backButton, nextButton])

    const statsWithBonuses = useMemo(() => {
        return (assignedStats || []).map(assignedStat => {
            const bonus = [...bonusStatSelections, ...flatStatBonuses]
                .filter(b => b.stat.replace("stats.", "") === assignedStat.stat)
                .reduce((sum, it) => sum + it.bonus, 0)
            return { stat: assignedStat.stat, value: ((assignedStat?.value ?? 0) + bonus) }
        })
    }, [assignedStats, bonusStatSelections, flatStatBonuses])

    const hasSpellSlots = [...ancestrySpellSlots, ...classSpellSlots].length > 0

    const renderStepContent = useCallback((id: string | undefined) => {
        switch (id) {
            case 'identity': return <NameAndAncestry />
            case 'class-selection': return <ClassSelection />
            case 'core-stats': return <CoreStats />
            case 'training-selection': return <TrainingSelection stats={statsWithBonuses} />
            case 'spell-selection': return hasSpellSlots ? <SpellSelection /> : null
            case 'perk-selection': return <PerkSelection />
            case 'equipment-selection': return <EquipmentSelection />
            default: return null
        }
    }, [
        hasSpellSlots, statsWithBonuses, NameAndAncestry, ClassSelection,
        CoreStats, TrainingSelection, SpellSelection, PerkSelection, EquipmentSelection
    ])

    const activeStepIds = useMemo(() => {
        const baseIds = ['identity', 'class-selection', 'core-stats', 'training-selection']
        if (hasSpellSlots) {
            baseIds.push('spell-selection')
        }
        baseIds.push('perk-selection', 'equipment-selection')
        return baseIds
    }, [hasSpellSlots])

    
    useEffect(() => {
        registerStepIds(activeStepIds)
    }, [activeStepIds, registerStepIds])

    
    const handleSaveAndFinish = useCallback(async () => {
        if (!ancestryItem || !classItem) return

        try {
            const createdItems = await hero.createEmbeddedDocuments("Item", [
                ancestryItem.toObject(),
                classItem.toObject()
            ]) as (Item & { system: { rules: any } })[]

            const stats: Record<string, number | number[]> = {
                'system.level.current': 1,
                'system.stats.baseStatBlock': selectedArr?.values ?? [],
                'system.stats.might': assignedStats?.find(s => s.stat === 'might')?.value ?? 2,
                'system.stats.dexterity': assignedStats?.find(s => s.stat === 'dexterity')?.value ?? 2,
                'system.stats.awareness': assignedStats?.find(s => s.stat === 'awareness')?.value ?? 2,
                'system.stats.reason': assignedStats?.find(s => s.stat === 'reason')?.value ?? 2,
                'system.stats.presence': assignedStats?.find(s => s.stat === 'presence')?.value ?? 2,
                'system.stats.luck': assignedStats?.find(s => s.stat === 'luck')?.value ?? 2
            }
            await hero.update(stats)

            const ancestry = createdItems.find(i => (i.type as string) === "ancestry")
            const clazz = createdItems.find(i => (i.type as string) === "class")
            const ancestryRules = ancestry ? foundry.utils.deepClone(ancestry.system.rules || []) : []
            const classRules = clazz ? foundry.utils.deepClone(clazz.system.rules || []) : []

            const getRuleSet = (id: string) => {
                return ancestryRules.find((r: any) => r.id === id && r.key === 'ChoiceSet') ??
                    classRules.find((r: any) => r.id === id && r.key === 'ChoiceSet')
            }

            const addSelection = (targetRuleSet: any, selection: string) => {
                if (targetRuleSet) {
                    if (!Array.isArray(targetRuleSet.selections)) {
                        targetRuleSet.selections = []
                    }
                    (targetRuleSet.selections as string[]).push(selection)
                }
            }

            bonusStatSelections.forEach(selection => {
                const targetRuleId = selection.id_index.split('_slot_')[0]
                addSelection(getRuleSet(targetRuleId), selection.stat)
            });

            [...chosenClassSkills, ...chosenBonusSkills].forEach(selection => {
                addSelection(getRuleSet(selection.ruleId), `skills.${selection.skill}.isTrained`)
            });

            [...classSpellSlots, ...ancestrySpellSlots].forEach(selection => {
                addSelection(getRuleSet(selection.ruleId), selection.value)
            });

            [...classPerkSlots, ...ancestryPerkSlots].forEach(selection => {
                addSelection(getRuleSet(selection.ruleId), selection.value)
            });

            // Push Rule alterations to Ancestry and Class
            if (ancestry) {
                await ancestry.update({ "system.rules": ancestryRules } as Record<string, any>)
            }
            if (clazz) {
                await clazz.update({ "system.rules": classRules } as Record<string, any>)
            }
        }
        catch (error) {
            console.error("VGLite | Hero Creator commit error:", error)
            ui.notifications?.error("An error occurred while saving your character, review your sheet for accuracy.")
        }
        finally {
            // Set the Hero up with max resources.
            await hero.update({
                'system.health.current': hero.system.health.max,
                'system.mana.current': hero.system.mana.max,
                'system.statuses.counters.luck': hero.system.stats.luck
            } as Record<any, any>)
            setClosed()
        }
    }, [
        hero, ancestryItem, classItem, selectedArr, assignedStats,
        bonusStatSelections, chosenClassSkills, chosenBonusSkills,
        ancestrySpellSlots, classSpellSlots, ancestryPerkSlots, classPerkSlots,
        setClosed
    ])

    useEffect(() => {
        registerOnFinish(handleSaveAndFinish)
    }, [registerOnFinish, handleSaveAndFinish])

    return (
        <div className="text-text-primary text-lg font-eskapade p-2 flex flex-col min-h-0 h-full overflow-hidden">
            {/* Current Step View */}
            <div className="flex-1 overflow-auto">
                {renderStepContent(stepId)}
            </div>

            {/* Bottom Button Panel Section */}
            <div className="flex items-center justify-between gap-x-4 pt-4 mt-auto border-t border-solid border-table-border">
                <div>{backButton}</div>
                <div>{nextButton}</div>
            </div>
        </div>
    )
}