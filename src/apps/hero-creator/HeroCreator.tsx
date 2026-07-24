import { useCallback, useEffect, useMemo, useState } from "react"
import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { useClassSelection } from "./step/ClassSelection"
import { useNameAndAncestry } from "./step/NameAndAncestry"
import { useCoreStats } from "./step/CoreStats"
import { useTrainingSelection } from "./step/TrainingSelection"
import { useSpellSelection } from "./step/SpellSelection"
import { usePerkSelection } from "./step/PerkSelection"
import { useEquipmentSelection } from "./step/EquipmentSelection"
import { useNavigation } from "../../view/context/navigation/NavigationContext"
import { ItemsCache } from "../../rules/util/ItemsCache"
import { PerkDataModel } from "../../model/item/character/PerkDataModel"
import { usePerkBonusSelection } from "./step/PerkBonusSelection"
import { Coins } from "../../model/common/CoinValue"

interface HeroCreatorProps {
    actor: Actor & { system: HeroDataModel }
    setClosed: () => void
}

export const HeroCreator = ({ actor, setClosed }: HeroCreatorProps) => {
    const { stepId, registerStepIds, registerOnFinish, backButton, nextButton } = useNavigation()
    const [perksWithBonusChoices, setPerksWithBonusChoices] = useState<(Item & { system: PerkDataModel })[]>([])

    const { NameAndAncestry, ancestryItem } = useNameAndAncestry(actor, [backButton, nextButton])
    const { ClassSelection, classItem } = useClassSelection(actor, [backButton, nextButton])
    const { CoreStats, selectedArr, assignedStats, bonusStatSelections, flatStatBonuses } = useCoreStats(ancestryItem, classItem, [backButton, nextButton])
    const { TrainingSelection, requiredTrainingRules, chosenClassSkills, chosenBonusSkills } = useTrainingSelection(ancestryItem, classItem, [backButton, nextButton])
    const { SpellSelection, ancestrySpellSlots, classSpellSlots } = useSpellSelection(ancestryItem, classItem, undefined, [backButton, nextButton])
    const { PerkSelection, ancestryPerkSlots, classPerkSlots } = usePerkSelection(ancestryItem, classItem, [backButton, nextButton])
    const { EquipmentSelection, wallet, cart, selectedPack } = useEquipmentSelection(classItem, [backButton, nextButton])

    const hasSpellSlots = [...ancestrySpellSlots, ...classSpellSlots].length > 0

    /**
     * Sum up all the stats and their selected bonuses for display
     * on the Skills selection screen.
     */
    const statsWithBonuses = useMemo(() => {
        return (assignedStats || []).map(assignedStat => {
            const bonus = [...bonusStatSelections, ...flatStatBonuses]
                .filter(b => b.stat.replace("stats.", "") === assignedStat.stat)
                .reduce((sum, it) => sum + it.bonus, 0)
            return { stat: assignedStat.stat, value: ((assignedStat?.value ?? 0) + bonus) }
        })
    }, [assignedStats, bonusStatSelections, flatStatBonuses])

    const { PerkBonusSelection } = usePerkBonusSelection(
        actor, perksWithBonusChoices, statsWithBonuses, requiredTrainingRules,
        [...chosenClassSkills, ...chosenBonusSkills],
        [...ancestrySpellSlots, ...classSpellSlots],
        [backButton, nextButton]
    )

    /**
     * This is a view mapper for the Hero creation wizard. The 
     * current index is controlled by the Navigation Context
     * Provider.
     */
    const renderStepContent = useCallback((id: string | undefined) => {
        switch (id) {
            case 'identity': return <NameAndAncestry />
            case 'class-selection': return <ClassSelection />
            case 'core-stats': return <CoreStats />
            case 'training-selection': return <TrainingSelection stats={statsWithBonuses} />
            case 'spell-selection': return hasSpellSlots ? <SpellSelection /> : null
            case 'perk-selection': return <PerkSelection />
            case 'perk-bonus-selection': return perksWithBonusChoices.length > 0 ? <PerkBonusSelection /> : null
            case 'equipment-selection': return <EquipmentSelection />
            default: return null
        }
    }, [
        hasSpellSlots, perksWithBonusChoices, statsWithBonuses, NameAndAncestry, ClassSelection,
        CoreStats, TrainingSelection, SpellSelection, PerkSelection, EquipmentSelection
    ])

    /**
     * This memo will "inject" optional views into the workflow.
     */
    const activeStepIds = useMemo(() => {
        const baseIds = ['identity', 'class-selection', 'core-stats', 'training-selection']
        if (hasSpellSlots) { baseIds.push('spell-selection') }
        baseIds.push('perk-selection')
        if (perksWithBonusChoices.length > 0) { baseIds.push('perk-bonus-selection') }
        baseIds.push('equipment-selection')
        return baseIds
    }, [hasSpellSlots, perksWithBonusChoices])

    useEffect(() => {
        registerStepIds(activeStepIds)
    }, [activeStepIds, registerStepIds])

    /**
     * Monitors the player's perk selections and will save a list
     * of any they select which will require a subsequent choice
     * selection.
     */
    useEffect(() => {
        const perks = ItemsCache.perks()
        const perksWithChoices: (Item & { system: PerkDataModel })[] = []
        for (const perkId of [...ancestryPerkSlots, ...classPerkSlots].map(slot => slot.value)) {
            const perk = perks.find(p => p.uuid === perkId)
            if (perk) {
                const choiceRules = perk.system.rules.filter(r => r.key === "ChoiceSet")
                if (choiceRules.length > 0) {
                    perksWithChoices.push(perk)
                }
            }
        }
        setPerksWithBonusChoices(perksWithChoices)
    }, [ancestryPerkSlots, classPerkSlots])
    
    /**
     * Copies the selected ancestry and class onto the Hero and maps
     * all the player's choices onto their respective rules. Bonus
     * selections (stats/training/spells) are not set statically, the 
     * rules engine will pick them up during the Hero's prepareDerivedData
     * lifecycle step.
     */
    const handleSaveAndFinish = useCallback(async () => {
        if (!ancestryItem || !classItem) return

        try {
            const createdItems = await actor.createEmbeddedDocuments("Item", [
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
            await actor.update(stats)

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
            if (selectedPack) {
                await actor.createEmbeddedDocuments("Item", [selectedPack.toObject(), ...cart.map(it => it.toObject())])
                await actor.update({ 'system.inventory.coins': wallet } as Record<string, Coins>)
            }
        }
        catch (error) {
            console.error("VGLite | Hero Creator commit error:", error)
            ui.notifications?.error("An error occurred while saving your character, review your sheet for accuracy.")
        }
        finally {
            // Set the Hero up with max resources.
            await actor.update({
                'system.health.current': actor.system.health.max,
                'system.mana.current': actor.system.mana.max,
                'system.statuses.counters.luck': actor.system.stats.luck
            } as Record<any, any>)
            setClosed()
        }
    }, [
        actor, ancestryItem, classItem, selectedArr, assignedStats,
        bonusStatSelections, chosenClassSkills, chosenBonusSkills,
        ancestrySpellSlots, classSpellSlots, ancestryPerkSlots, classPerkSlots,
        wallet, cart, selectedPack, setClosed
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
            <div className="flex items-center justify-between gap-x-4 pt-4 mt-auto mb-2 border-t border-solid border-table-border">
                <div>{backButton}</div>
                <div>{nextButton}</div>
            </div>
        </div>
    )
}