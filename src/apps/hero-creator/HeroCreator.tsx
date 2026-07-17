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
import { AncestryDataModel } from "../../model/item/character/AncestryDataModel"
import { CombinedItemsMultiType } from "../../utils/modelUtil"

export const HeroCreator = ({ hero, setClosed }: { hero: Actor & { system: HeroDataModel }, setClosed: () => void }) => {
    const { stepId, registerStepIds, registerOnFinish } = useNavigationContext()
    const { NameAndAncestry, ancestryItem } = useNameAndAncestry(hero)
    const { ClassSelection, classItem } = useClassSelection(hero)
    const { CoreStats, selectedArr, assignedStats, bonusStatSelections, flatStatBonuses } = useCoreStats(ancestryItem, classItem)
    const { TrainingSelection, chosenClassSkills, chosenBonusSkills } = useTrainingSelection(ancestryItem, classItem)
    const { SpellSelection, ancestrySpellSlots, classSpellSlots } = useSpellSelection(ancestryItem, classItem)
    const { PerkSelection, ancestryPerkSlots, classPerkSlots } = usePerkSelection(ancestryItem, classItem)
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
        registerOnFinish(async () => {
            if (ancestryItem && classItem) {
                try {
                    await hero.createEmbeddedDocuments("Item", [ancestryItem.toObject(), classItem.toObject()])
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
                    hero.update(stats)

                    const ancestry = hero.items.find(i => (i.type as string) === "ancestry") as Item & { system: AncestryDataModel }
                    const clazz = hero.items.find(i => (i.type as string) === "class") as Item & { system: AncestryDataModel }
                    const ancestryRules = ancestry ? foundry.utils.deepClone(ancestry.system.rules || []) : []
                    const classRules = clazz ? foundry.utils.deepClone(clazz.system.rules || []) : []

                    const getRuleSet = (id: string) => {
                        return ancestryRules.find((r: any) => r.id === id && r.key === 'ChoiceSet') ??
                            classRules.find((r: any) => r.id === id && r.key === 'ChoiceSet')
                    }

                    const addSelection = (targetRuleSet, selection) => {
                        if (targetRuleSet) {
                            if (!Array.isArray(targetRuleSet.selections)) {
                                targetRuleSet.selections = []
                            }
                            (targetRuleSet.selections as string[]).push(selection)
                        }
                    }

                    const addSelectedSpellsAndPerks = async (): Promise<any[]> => {
                        const items = await CombinedItemsMultiType(['spell', 'perk'])
                        const embeddedDocs: any[] = []

                        for (const slot of [...ancestrySpellSlots, ...classSpellSlots, ...ancestryPerkSlots, ...classPerkSlots]) {
                            const match = items.find(entry => entry.id === slot.value)
                            if (!match) continue

                            let fullItem: Item | null
                            if (match.uuid && match.uuid.startsWith('Compendium.')) {
                                fullItem = fromUuidSync(match.uuid) as Item | null
                            }
                            else {
                                fullItem = match as Item
                            }

                            if (fullItem) {
                                const itemCopy = fullItem.toObject()
                                delete (itemCopy as any)._id // <-- let Foundry generate this
                                embeddedDocs.push(itemCopy)
                            }
                        }

                        return embeddedDocs
                    }

                    /**
                     * Set bonus stat selections...
                     */
                    bonusStatSelections.forEach(selection => {
                        const targetRuleId = selection.id_index.split('_slot_')[0]
                        addSelection(getRuleSet(targetRuleId), selection.stat)
                    });

                    /**
                     * Set chosen skill trainings...
                     */
                    [...chosenClassSkills, ...chosenBonusSkills].forEach(selection => {
                        addSelection(getRuleSet(selection.ruleId), `skills.${selection.skill}.isTrained`)
                    });

                    /**
                     * Commit all updates to Ancestry and Class choices...
                     */
                    if (ancestryItem) {
                        await ancestryItem.update({ "system.rules": ancestryRules } as Record<string, any>)
                    }
                    if (classItem) {
                        await classItem.update({ "system.rules": classRules } as Record<string, any>)
                    }

                    /**
                     * Add selected Spells and Perks...
                     */
                    const embeddedDocs = await addSelectedSpellsAndPerks()
                    if (embeddedDocs.length > 0) {
                        await hero.createEmbeddedDocuments("Item", embeddedDocs)
                    }
                }
                catch (error) {
                    console.error("VGLite | Hero Creator commit error:", error)
                    ui.notifications?.error("An error occurred while saving yoru character, review your sheet for accuracy.")
                }
                finally {
                    setClosed()
                }
            }
        })
    }, [registerOnFinish, ancestryItem, classItem,
        assignedStats, bonusStatSelections, chosenClassSkills,
        chosenBonusSkills, ancestrySpellSlots, classSpellSlots,
        ancestryPerkSlots, classPerkSlots
    ])

    return (
        <div className="text-text-primary text-lg font-eskapade p-2 overflow-auto">
            {activeSteps.find(s => s.id === stepId)?.view}
        </div>
    )
}