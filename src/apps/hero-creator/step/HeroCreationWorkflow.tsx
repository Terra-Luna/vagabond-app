import { useCallback, useEffect, useMemo, useState } from "react"
import { HeroDataModel } from "../../../model/actor/HeroDataModel"
import { useClassSelection } from "./ClassSelection"
import { useAncestrySelection } from "./AncestrySelection"
import { useCoreStats } from "./CoreStats"
import { useTrainingSelection } from "./TrainingSelection"
import { useSpellSelection } from "./SpellSelectionUseCase"
import { usePerkSelection } from "./PerkSelectionUseCase"
import { useEquipmentSelection } from "./EquipmentSelection"
import { useNavigation } from "../../../view/context/navigation/NavigationContext"
import { ItemsCache } from "../../../rules/util/ItemsCache"
import { PerkDataModel } from "../../../model/item/character/PerkDataModel"
import { usePerkBonusSelection } from "./PerkBonusSelection"
import { Coins } from "../../../model/common/CoinValue"
import { savePerkSelectionFlags } from "../../../rules/util/item-rules-util"

export interface HeroCreatorArgs {
    actor: Actor & { system: HeroDataModel }
    setClosed: () => void
}

export const HeroCreationWorkflow = ({ actor, setClosed }: HeroCreatorArgs) => {
    const { stepId, registerStepIds, registerOnFinish, backButton, nextButton } = useNavigation()
    const [perksWithBonusChoices, setPerksWithBonusChoices] = useState<(Item & { system: PerkDataModel })[]>([])

    /**
     * Ancestry & Class
     */
    const { AncestrySelection, ancestryItem } = useAncestrySelection([backButton, nextButton])
    const { ClassSelection, classItem } = useClassSelection(actor, [backButton, nextButton])

    /**
     * Core stats
     */
    const { CoreStats, selectedArr, assignedStats, bonusStatSelections, flatStatBonuses, resetAssignedStats } = useCoreStats(ancestryItem, classItem, [backButton, nextButton])

    const statsWithBonuses = useMemo(() => {
        return (assignedStats || []).map(assignedStat => {
            const bonus = [...bonusStatSelections, ...flatStatBonuses]
                .filter(b => b.stat.replace("stats.", "") === assignedStat.stat)
                .reduce((sum, it) => sum + it.bonus, 0)
            return { stat: assignedStat.stat, value: ((assignedStat?.value ?? 0) + bonus) }
        })
    }, [assignedStats, bonusStatSelections, flatStatBonuses])

    const statsAsKeyValue = useMemo(() => {
        return statsWithBonuses.reduce((schema, { stat, value }) => { schema[stat] = value; return schema; }, {} as any)
    }, [statsWithBonuses])

    /**
     * Trainings
     */
    const { TrainingSelection, requiredTrainingRules, chosenLevel1Skills, chosenBonusSkills, setChosenLevel1Skills, setChosenBonusSkills, level1TrainingRules } = useTrainingSelection(ancestryItem, classItem, statsWithBonuses, [backButton, nextButton])

    const selectedTrainings = useMemo(() => {
        return [...chosenLevel1Skills, ...chosenBonusSkills].map(sk => sk.skill)
    }, [chosenLevel1Skills, chosenBonusSkills])

    /**
     * Spellcasting
     */
    const { SpellSelection, ancestrySpellSlots, classSpellSlots, perkSpellSlots } = useSpellSelection(ancestryItem, classItem, undefined, [backButton, nextButton])

    const selectedSpellNames = useMemo(() => {
        return [...ancestrySpellSlots, ...classSpellSlots].map(slot => slot.label)
    }, [ancestrySpellSlots, classSpellSlots])

    const hasSpellSlots = useMemo(() => {
        return [...ancestrySpellSlots, ...classSpellSlots].length > 0
    }, [ancestrySpellSlots, classSpellSlots, perkSpellSlots])

    /**
     * Perks
     */
    const { PerkSelection, ancestryPerkSlots, classPerkSlots } = usePerkSelection(ancestryItem, classItem, statsAsKeyValue, selectedTrainings, selectedSpellNames, [backButton, nextButton], 1, false)

    const { PerkBonusSelection, advancement, perkTraining, reasonTraining, spell, resetPerkBonusSelections } = usePerkBonusSelection(
        perksWithBonusChoices, statsWithBonuses, requiredTrainingRules,
        [...chosenLevel1Skills, ...chosenBonusSkills],
        [...ancestrySpellSlots, ...classSpellSlots],
        [backButton, nextButton]
    )

    /**
     * Starting packs & Item shop
     */
    const { EquipmentSelection, wallet, cart, selectedPack } = useEquipmentSelection(classItem, [backButton, nextButton])

    /**
     * This is a view mapper for the Hero creation wizard. The 
     * current index is controlled by the Navigation Context
     * Provider.
     */
    const renderStepContent = useCallback((id: string | undefined) => {
        switch (id) {
            case 'identity': return AncestrySelection
            case 'class-selection': return ClassSelection
            case 'core-stats': return CoreStats
            case 'training-selection': return TrainingSelection
            case 'spell-selection': return hasSpellSlots ? SpellSelection : null
            case 'perk-selection': return PerkSelection
            case 'perk-bonus-selection': return perksWithBonusChoices.length > 0 ? PerkBonusSelection : null
            case 'equipment-selection': return EquipmentSelection
            default: return null
        }
    }, [
        hasSpellSlots, perksWithBonusChoices, statsWithBonuses, AncestrySelection, ClassSelection,
        CoreStats, TrainingSelection, SpellSelection, PerkSelection, EquipmentSelection
    ])

    /**
     * This memo will "inject" optional views into the workflow.
     */
    const activeStepIds = useMemo(() => {
        const baseIds = ['identity', 'class-selection', 'core-stats', 'training-selection']
        if (hasSpellSlots) { baseIds.push('spell-selection') }
        if ([...ancestryPerkSlots, ...classPerkSlots].length > 0) baseIds.push('perk-selection')
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
     * Clear out selections when key updates are made.
     */
    useEffect(() => {
        resetAssignedStats()
        setChosenLevel1Skills([])
        setChosenBonusSkills([])
        resetPerkBonusSelections()
        setPerksWithBonusChoices([])
    }, [ancestryItem, classItem])
    
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
            const classRules = clazz ? foundry.utils.deepClone([...clazz.system.rules, ...level1TrainingRules]) : []

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

            const chosenSkills = [...chosenLevel1Skills, ...chosenBonusSkills]
            if (reasonTraining) {
                chosenSkills.push({ skill: reasonTraining.value, ruleId: chosenLevel1Skills[0].ruleId })
            }
            chosenSkills.forEach(selection => {
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

            // Process their shop selections and add their wallet balance to their starting coin.
            const cartItems = [...cart.map(it => it.toObject())]
            if (selectedPack) cartItems.push(selectedPack.toObject())
            await actor.createEmbeddedDocuments("Item", cartItems)
            await actor.update({ 'system.inventory.coins': wallet } as Record<string, Coins>)

            /**
             * Process selections made due to choosing perks:
             * 'Advancement', 'New Training', and 'Magical Secret'.
             */
            if (advancement) savePerkSelectionFlags(actor, [advancement])
            if (perkTraining) savePerkSelectionFlags(actor, [perkTraining])
            if (spell) savePerkSelectionFlags(actor, [spell])

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
        bonusStatSelections, chosenLevel1Skills, chosenBonusSkills,
        ancestrySpellSlots, classSpellSlots, ancestryPerkSlots, classPerkSlots,
        advancement, perkTraining, reasonTraining, spell,
        wallet, cart, selectedPack, setClosed
    ])

    useEffect(() => {
        registerOnFinish(handleSaveAndFinish)
    }, [registerOnFinish, handleSaveAndFinish])

    return (
        <div className="text-text-primary text-lg font-eskapade flex flex-col min-h-0 h-full p-2 overflow-hidden">
            {/* Current Step View */}
            <div className="flex-1 overflow-auto">
                {renderStepContent(stepId)}
            </div>
        </div>
    )
}