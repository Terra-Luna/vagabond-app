import { ArrowsUpFromLine, MoveLeft, MoveRight } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { ClassDataModel } from "../../model/item/character/ClassDataModel"
import { calculateRecurringRuleEligibility, getItemChoiceRules, getItemRules, getRuleSelectionValues, randomId, saveItemRuleSelections } from "../../rules/util/item-rules-util"
import { ItemsCache } from "../../rules/util/ItemsCache"
import { groupBy } from "../../utils/collectionUtil"
import { appLang } from "../../utils/lang"
import { createDropdownEntriesFromObj } from "../../utils/localeUtils"
import { DestructiveButton, PrimaryButton, SecondaryButton } from "../../view/component/Button"
import { Divider, Header } from "../../view/component/Header"
import { SkillCard } from "../../view/component/SkillCard"
import { EditModeContextProvider } from "../../view/context/EditModeContext/EditModeContext"
import { EditModeOptions } from "../../view/context/EditModeContext/EditModeOptions"
import { usePerkBonusSelection } from "../hero-choices/perks/PerkBonusSelection"
import { usePerkSelection } from "../hero-choices/perks/PerkSelectionUseCase"
import { useSpellSelection } from "../hero-choices/spells/SpellSelectionUseCase"
import { HeroCreationDropdown } from "../hero-creator/component/HeroCreationDropdown"
import { HeroCreationLabel } from "../hero-creator/component/HeroCreationTypography"
import { useClassSelection } from "../hero-creator/step/ClassSelection"

export interface PerkBonusSelection {
    value: string
    ruleId: string
    selectionId?: string
}

type LevelUpStep = 'class-selection' | 'feats' | 'spells' | 'perks'

export interface LevelUpArgs {
    levelUpStat?: string
    newRsnTraining?: string
    advancement?: PerkBonusSelection
    spell?: PerkBonusSelection
    perkTraining?: PerkBonusSelection
    reasonTraining?: PerkBonusSelection
    advancements?: PerkBonusSelection[]
    perkTrainings?: PerkBonusSelection[]
    reasonTrainings?: PerkBonusSelection[]
    spells?: PerkBonusSelection[]
    isComplete?: boolean
}

export const LevelUpView = ({ actor, onSave }: { actor: Actor & { system: HeroDataModel }, onSave: (args: LevelUpArgs) => void }) => {

    const [levelUpStat, setLevelUpStat] = useState<string | undefined>()
    const [startingRsn, setStartingRsn] = useState<number>(actor.system.stats.reason ?? 2)
    const [newRsnTraining, setNewRsnTraining] = useState<string | undefined>()
    const nextLevel = actor.system.level.current! + 1

    const actorClassItem = actor.items.find(item => (item.type as string) === 'class') as (Item & { system: ClassDataModel }) | undefined
    const classFeature = ItemsCache.features()
        .filter(feature => actor.system.class?.featureIds?.includes(feature.uuid))
        .map(feature => ({ feature, level: feature.system.level }))
        .find(({ level, feature }) => level === nextLevel || (feature.system.scale > 0 && calculateRecurringRuleEligibility(nextLevel, level, feature.system.scale)))

    const { ClassSelection, classItem: selectedClassItem } = useClassSelection([])

    /**
     * Falls back to the pending (not-yet-embedded) class selection so the
     * spell/perk steps can be determined before the class item is saved.
     */
    const levelUpChoices = () => {
        return getItemChoiceRules(nextLevel, getItemRules(actorClassItem ?? selectedClassItem))
            .filter(r => r.level === nextLevel || calculateRecurringRuleEligibility(nextLevel, r.level, r.scale))
    }
    const { PerkSelection, bonusChoicesByPerk, classPerkSlots } = usePerkSelection(actor, true, actorClassItem ? undefined : selectedClassItem)
    const { SpellSelection, classSpellSlots, perkSpellSlots, ancestrySpellSlots, classSpellGrants, ancestrySpellGrants } = useSpellSelection(actor, true, actorClassItem ? undefined : selectedClassItem)

    const perks = useMemo(() => { return ItemsCache.perks() }, [])

    const selectedPerks = useMemo(() => {
        return classPerkSlots
            .map(slot => perks.find(perk => perk.uuid === slot.value))
            .filter(Boolean)
    }, [classPerkSlots, perks])

    const initialBonusSelections = useMemo(() => {
        return Object.fromEntries(actor.system.perks.flatMap(perk =>
            (perk.rules ?? []).map(rule => [rule.id, getRuleSelectionValues(rule.selections)])))
    }, [actor.system.perks])

    const stats = useMemo(() => {
        setStartingRsn(actor.system.stats.reason ?? 0)
        const statKeys = Object.keys(appLang.Stat)
        return statKeys.map(k => (
            { stat: k, value: actor.system.stats[k] }
        ))
    }, [])

    const trainings = useMemo(() => {
        return Object.keys(actor.system.skills).flatMap(k => {
            if (actor.system.skills[k].trained) return [{ skill: k, ruleId: '' }]
            else return []
        })
    }, [])

    const { advancement, spell, perkTraining, reasonTraining, advancements, spells, perkTrainings, reasonTrainings, resetPerkBonusSelections } = usePerkBonusSelection(
        selectedPerks as any, stats, [], trainings,
        [...ancestrySpellSlots, ...classSpellSlots, ...perkSpellSlots],
        classSpellGrants, ancestrySpellGrants, [], initialBonusSelections
    )

    const latestPerk = selectedPerks[selectedPerks.length - 1]
    const showPerkSelection = useMemo(() => { return levelUpChoices().some(ch => ch.pack === 'perk') }, [selectedClassItem])
    const showSpellSelection = useMemo(() => { return levelUpChoices().some(ch => ch.pack === 'spell') }, [selectedClassItem])

    useEffect(() => {
        resetPerkBonusSelections()
    }, [latestPerk])

    const upgradableStatsOptions = () => {
        const allOptions = [{ value: '', label: '-' }, ...createDropdownEntriesFromObj(appLang.Stat)]
        return allOptions.filter(it => it.value === '' || (stats?.find(s => s.stat === it.value)?.value ?? 0) < 7)
    }

    const untrainedSkills = () => {
        const allOptions = [{ value: '', label: '-' }, ...createDropdownEntriesFromObj(appLang.Skills)]
        return allOptions.filter(it => it.value === '' || !trainings?.some(t => t.skill === it.value))
    }

    const isStatBoostOptionAvailable = () => {
        return nextLevel % 2 === 0 && upgradableStatsOptions().length > 1
    }

    /**
     * Hook on Actor updates so we know to prompt the player to select
     * a new training if they push their Reason stat to an odd value.
     */
    const [actorUpdateTick, setActorUpdateTick] = useState(0)
    useEffect(() => {
        const hookId = Hooks.on('updateActor', (updatedActor) => {
            if (updatedActor.id === actor.id) {
                setActorUpdateTick(prev => prev + 1)
            }
        })
        return () => Hooks.off('updateActor', hookId)
    }, [actor.id])

    const isRsnTrainingOptionAvailable = useMemo(() => {
        const newRsnStatVal = (actor.system.stats.reason ?? 2) + (levelUpStat === 'reason' ? 1 : 0)
        const isRsnIncreased = newRsnStatVal > startingRsn
        return isRsnIncreased && newRsnStatVal % 2 > 0
    }, [actor.system.stats.reason, levelUpStat, startingRsn, actorUpdateTick])

    const [isSaving, setIsSaving] = useState<boolean>(false)

    /**
     * Level-up workflow steps, filtered down to only those with content to show.
     */
    const stepOrder: LevelUpStep[] = ['class-selection', 'feats', 'spells', 'perks']
    const showFeatsSelection = Boolean(classFeature) || nextLevel % 2 === 0 || isRsnTrainingOptionAvailable
    const stepVisibility: Record<LevelUpStep, boolean> = {
        'class-selection': !actorClassItem,
        'feats': showFeatsSelection,
        'spells': showSpellSelection,
        'perks': showPerkSelection
    }
    const visibleSteps = stepOrder.filter(step => stepVisibility[step])

    const [stepIndex, setStepIndex] = useState(0)
    useEffect(() => {
        setStepIndex(prev => Math.min(prev, Math.max(visibleSteps.length - 1, 0)))
    }, [visibleSteps.length])

    const currentStep = visibleSteps[stepIndex]
    const isLastStep = stepIndex >= visibleSteps.length - 1

    const goToNextStep = async () => {
        if (currentStep === 'class-selection') {
            if (!selectedClassItem) {
                ui.notifications?.warn("Select a class to continue...")
                return
            }
        }
        if (currentStep === 'feats') {
            if (isStatBoostOptionAvailable() && !levelUpStat) {
                ui.notifications?.warn("Select a Stat to increase before saving...")
                return
            }
            if (isRsnTrainingOptionAvailable && !newRsnTraining) {
                ui.notifications?.warn("Select a new Skill Training before saving...")
                return
            }
        }
        setStepIndex(prev => Math.min(prev + 1, visibleSteps.length - 1))
    }

    const goToPreviousStep = () => {
        setStepIndex(prev => Math.max(prev - 1, 0))
    }

    /**
     * The class/perk/spell selection hooks skip persistence while the class isn't
     * embedded yet, so once it's created we need to save the selections.
     */
    const persistPendingClassSelections = async (classItem: Item & { system: ClassDataModel }, slots: { value: string, ruleId: string, selectionId?: string }[]) => {
        const chosenSlots = slots.filter(slot => slot.value)
        if (!chosenSlots.length) return
        const rules = getItemRules(classItem)
        const selectionUpdates = Object.fromEntries(
            Object.entries(groupBy("ruleId", chosenSlots))
                .filter(([ruleId]) => rules.some(rule => rule.id === ruleId))
                .map(([ruleId, grouped]) => [ruleId, (grouped as typeof chosenSlots).map(slot => ({
                    id: slot.selectionId ?? randomId(),
                    value: slot.value,
                    subselect: ""
                }))])
        )
        await saveItemRuleSelections(classItem, selectionUpdates)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isLastStep) {
            await goToNextStep()
            return
        }
        if (!actorClassItem && !selectedClassItem) {
            ui.notifications?.warn("Select a class to continue...")
            return
        }
        if (isStatBoostOptionAvailable() && !levelUpStat) {
            ui.notifications?.warn("Select a Stat to increase before saving...")
            return
        }
        if (isRsnTrainingOptionAvailable && !newRsnTraining) {
            ui.notifications?.warn("Select a new Skill Training before saving...")
            return
        }
        setIsSaving(true)

        // The chosen class is only embedded on the actor once the whole workflow is confirmed.
        if (!actorClassItem && selectedClassItem) {
            const [createdClassItem] = await actor.createEmbeddedDocuments("Item", [selectedClassItem.toObject()]) as (Item & { system: ClassDataModel })[]
            await persistPendingClassSelections(createdClassItem, [...classPerkSlots, ...classSpellSlots])
        }

        onSave({
            levelUpStat: levelUpStat,
            newRsnTraining: newRsnTraining,
            advancement: advancement,
            spell: spell,
            perkTraining: perkTraining,
            reasonTraining: reasonTraining,
            advancements,
            spells,
            perkTrainings,
            reasonTrainings,
            isComplete: true
        })
    }

    /**
     * Reason-Training dropdown, shown on the 'feats' step and again above
     * Perks so it stays visible regardless of where the user ends up.
     */
    const NewTrainingBlock = isRsnTrainingOptionAvailable && (
        <div className="flex flex-col justify-center items-center mb-2">
            <Header title={"NEW TRAINING"} />
            <p className="flex justify-center m-4 text-base text-text-primary text-justify font-eskapade font-normal shrink-0">
                Your increased Reason has granted you another Training selection...
            </p>
            <HeroCreationDropdown
                value={newRsnTraining ?? ''}
                options={untrainedSkills()}
                onChange={(selection: string) => setNewRsnTraining(selection)}
            />
        </div>
    )

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full bg-sheet-main-fill p-2 overflow-hidden">
            {/* HEADER WITH CANCEL/BACK & NEXT/SAVE BUTTONS */}
            {!isSaving && <div className="grid grid-cols-3 items-center my-1 shrink-0">
                {/* Left Column: Buttons */}
                <div className="flex gap-x-2 justify-self-start">
                    <DestructiveButton onClick={() => onSave({ isComplete: false })}>
                        {appLang.ButtonActions.cancel}
                    </DestructiveButton>

                    {stepIndex > 0 &&
                        <SecondaryButton onClick={goToPreviousStep}>
                            <div className="flex items-center gap-x-2">
                                <MoveLeft size={14} />
                                {appLang.ButtonActions.back}
                            </div>
                        </SecondaryButton>
                    }
                </div>

                {/* Center Column: Level Up (Dead-Center) */}
                <p className="flex gap-x-2 items-center text-2xl text-text-primary font-eskapade font-bold justify-self-center">
                    <ArrowsUpFromLine size={24} className="text-wealth-denom-label" />
                    LEVEL UP
                    <ArrowsUpFromLine size={24} className="text-wealth-denom-label" />
                </p>

                {/* Right Column: Submit Button */}
                <div className="justify-self-end">
                    <PrimaryButton type="submit" icon={isLastStep ? <ArrowsUpFromLine size={16} /> : <MoveRight size={16} />}>
                        {isLastStep ? 'Save & Finish' : appLang.ButtonActions.next}
                    </PrimaryButton>
                </div>
            </div>}

            <div className="my-1 shrink-0">
                <Divider />
            </div>

            {!isSaving &&
                <EditModeContextProvider initialEditMode={EditModeOptions.TRUE}>
                    <div className="@container flex-1 min-h-0 flex flex-col gap-y-2 overflow-y-auto">
                        {/* NO SELECTIONS REQUIRED */}
                        {visibleSteps.length === 0 &&
                            <p className="flex justify-center m-4 text-xl text-text-primary text-justify font-eskapade font-normal shrink-0">
                                No selections required.
                            </p>
                        }

                        {/* LEVEL 1 CLASS SELECTION */}
                        {currentStep === 'class-selection' &&
                            <div>
                                {ClassSelection}
                            </div>
                        }

                        {/* FEATS STEP: CLASS FEATURE, STAT BOOST & RSN TRAINING */}
                        {currentStep === 'feats' &&
                            <>
                                {(classFeature || nextLevel % 2 === 0) &&
                                    <div className="flex gap-x-2 shrink-0">
                                        {/* LATEST/UPGRADED CLASS FEATURE CARDS */}
                                        {classFeature &&
                                            <div className="flex-1 space-y-1">
                                                <Header title={"CLASS FEATURE"} />
                                                <SkillCard
                                                    title={classFeature.feature.name}
                                                    subtitles={[{ label: "Level", value: classFeature.level }]}
                                                    description={classFeature.feature.system.dynamicDescription(nextLevel)}
                                                    startCollapsed={false}
                                                />
                                            </div>
                                        }

                                    {/* LEVEL-UP STAT BOOST (EVEN LEVELS) */}
                                    {isStatBoostOptionAvailable() &&
                                        <div className="flex-1 space-y-1 text-center">
                                            <Header title="STAT INCREASE" />
                                            <HeroCreationLabel text={"Select a stat (Max: 7)"} />
                                            <div className="flex w-full justify-center">
                                                <HeroCreationDropdown
                                                    value={levelUpStat ?? ''}
                                                    options={upgradableStatsOptions()}
                                                    onChange={(selection: string) => setLevelUpStat(selection)}
                                                />
                                            </div>
                                        </div>
                                    }

                                </div>
                            }

                            {/* NEW TRAINING ON INCREASED RSN STAT */}
                                {NewTrainingBlock}
                            </>
                        }

                        {/* SPELLS STEP */}
                        {currentStep === 'spells' &&
                            <div className="flex flex-col gap-y-1 overflow-y-auto pr-1 h-full w-full max-w-3xl mx-auto">
                                {SpellSelection}
                            </div>
                        }

                        {/* PERKS STEP */}
                        {currentStep === 'perks' &&
                            <div className="flex flex-col gap-y-1 overflow-y-auto pr-1 h-full w-full max-w-3xl mx-auto">
                                {/* Also shown here in case Reason was increased after leaving the 'feats' step */}
                                {NewTrainingBlock}
                                <PerkSelection bonusChoices={bonusChoicesByPerk} />
                            </div>
                        }
                    </div>
                </EditModeContextProvider>
            }
        </form>

    )
}