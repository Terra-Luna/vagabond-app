import { ArrowsUpFromLine } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { ClassDataModel } from "../../model/item/character/ClassDataModel"
import { calculateRecurringRuleEligibility, getItemChoiceRules, getRuleSelectionValues } from "../../rules/util/item-rules-util"
import { ItemsCache } from "../../rules/util/ItemsCache"
import { vgLiteLang } from "../../utils/lang"
import { createDropdownEntriesFromObj } from "../../utils/localeUtils"
import { DestructiveButton, PrimaryButton } from "../../view/component/Button"
import { Divider, Header } from "../../view/component/Header"
import { SkillCard } from "../../view/component/SkillCard"
import { EditModeContextProvider } from "../../view/context/EditModeContext/EditModeContext"
import { EditModeOptions } from "../../view/context/EditModeContext/EditModeOptions"
import { usePerkSelectionView } from "../hero-choices/PerkSelectionView"
import { useSpellSelectionView } from "../hero-choices/SpellSelectionView"
import { HeroCreationDropdown } from "../hero-creator/component/HeroCreationDropdown"
import { HeroCreationLabel } from "../hero-creator/component/HeroCreationTypography"
import { useClassSelection } from "../hero-creator/step/ClassSelection"
import { usePerkBonusSelection } from "../hero-creator/step/PerkBonusSelection"

export interface PerkBonusSelection {
    value: string
    ruleId: string
    selectionId?: string
}

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

    const [selectedClass, setSelectedClass] = useState<(Item & { system: ClassDataModel }) | undefined>(actor.items.find(it => (it.type as string) === 'class') as any)
    const [levelUpStat, setLevelUpStat] = useState<string | undefined>()
    const [startingRsn, setStartingRsn] = useState<number>(actor.system.stats.reason ?? 2)
    const [newRsnTraining, setNewRsnTraining] = useState<string | undefined>()
    const nextLevel = actor.system.level.current! + 1

    const classFeature = actor.system.class?.features
        ?.find(it => it.level === nextLevel || calculateRecurringRuleEligibility(nextLevel, it.level ?? 0, it.scale ?? 0))

    const levelUpChoices = () => {
        return getItemChoiceRules(nextLevel, actor.system.class?.rules)
            .filter(r => r.level === nextLevel || calculateRecurringRuleEligibility(nextLevel, r.level, r.scale))
    }

    const { ClassSelection, classItem } = useClassSelection([])
    const { PerkSelection, bonusChoicesByPerk, classPerkSlots } = usePerkSelectionView(actor, true)
    const { SpellSelection, classSpellSlots, perkSpellSlots, ancestrySpellSlots, classSpellGrants, ancestrySpellGrants } = useSpellSelectionView(actor, true)

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
        const statKeys = Object.keys(vgLiteLang.Stat)
        return statKeys.map(k => (
            { stat: k, value: actor.system.stats[k] }
        ))
    }, [])

    const trainings = useMemo(() => {
        return Object.keys(actor.system.skills).flatMap(k => {
            if (actor.system.skills[k].isTrained) return [{ skill: k, ruleId: '' }]
            else return []
        })
    }, [])

    const { advancement, spell, perkTraining, reasonTraining, advancements, spells, perkTrainings, reasonTrainings, resetPerkBonusSelections } = usePerkBonusSelection(
        selectedPerks as any, stats, [], trainings,
        [...ancestrySpellSlots, ...classSpellSlots, ...perkSpellSlots],
        classSpellGrants, ancestrySpellGrants, [], initialBonusSelections
    )

    const latestPerk = selectedPerks[selectedPerks.length - 1]
    const showPerkSelection = useMemo(() => { return levelUpChoices().some(ch => ch.pack === 'perk') }, [selectedClass])
    const showSpellSelection = useMemo(() => { return levelUpChoices().some(ch => ch.pack === 'spell') }, [selectedClass])



    useEffect(() => {
        resetPerkBonusSelections()
    }, [latestPerk])

    const upgradableStatsOptions = () => {
        const allOptions = [{ value: '', label: '-' }, ...createDropdownEntriesFromObj(vgLiteLang.Stat)]
        return allOptions.filter(it => it.value === '' || (stats?.find(s => s.stat === it.value)?.value ?? 0) < 7)
    }

    const untrainedSkills = () => {
        const allOptions = [{ value: '', label: '-' }, ...createDropdownEntriesFromObj(vgLiteLang.Skills)]
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
        const hookId = Hooks.on('updateActor', (updatedActor, changes) => {
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedClass && !classItem) {
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

        if (!selectedClass && classItem) {
            await actor.createEmbeddedDocuments("Item", [classItem.toObject()])
            setSelectedClass(classItem)
            setIsSaving(false)
        }
        else {
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
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full bg-sheet-main-fill p-2 overflow-hidden">
            {/* HEADER WITH SAVE & CANCEL BUTTONS */}
            <div className="flex justify-between my-1 shrink-0">
                <DestructiveButton onClick={() => onSave({ isComplete: false })}>
                    {vgLiteLang.ButtonActions.cancel}
                </DestructiveButton>

                <p className="flex gap-x-2 items-center text-2xl text-text-primary font-eskapade font-bold">
                    <ArrowsUpFromLine size={24} className="text-wealth-denom-label" />
                    LEVEL UP
                    <ArrowsUpFromLine size={24} className="text-wealth-denom-label" />
                </p>

                <PrimaryButton type="submit" icon={<ArrowsUpFromLine size={16} />}>
                    {`${!selectedClass ? 'Save & Continue' : 'Save & Finish'}`}
                </PrimaryButton>
            </div>

            <div className="my-1 shrink-0">
                <Divider />
            </div>

            {!isSaving &&
                <EditModeContextProvider initialEditMode={EditModeOptions.TRUE}>
                    <div className="@container flex-1 min-h-0 flex flex-col gap-y-2 overflow-y-auto">
                        {/* LEVEL 1 CLASS SELECTION */}
                        {!selectedClass &&
                            <div>
                                {ClassSelection}
                            </div>
                        }

                        {/* NO SELECTIONS REQUIRED */}
                        {levelUpChoices.length === 0 && upgradableStatsOptions().length === 1 &&
                            <p className="flex justify-center m-4 text-xl text-text-primary text-justify font-eskapade font-normal shrink-0">
                                No selections required.
                            </p>
                        }

                        {/* CLASS FEATURE CARD */}
                        {(classFeature || nextLevel % 2 === 0) &&
                            <div className="flex gap-x-2 shrink-0">
                                {/* LATEST/UPGRADED CLASS FEATURE CARDS */}
                                {classFeature &&
                                    <div className="flex-1 space-y-1">
                                        <Header title={"CLASS FEATURE"} />
                                        <SkillCard
                                            title={classFeature.name}
                                            subtitles={[{ label: "Level", value: classFeature.level }]}
                                            description={classFeature.description}
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
                        {isRsnTrainingOptionAvailable &&
                            <div className="flex flex-col justify-center items-center mb-2">
                                <Header title={"NEW TRAINING"} />
                                <p className="flex justify-center m-4 text-xl text-text-primary text-justify font-eskapade font-normal shrink-0">
                                    Your increased Reason has granted you another Training selection...
                                </p>
                                <HeroCreationDropdown
                                    value={newRsnTraining ?? ''}
                                    options={untrainedSkills()}
                                    onChange={(selection: string) => setNewRsnTraining(selection)}
                                />
                            </div>
                        }

                        {/* SELECTIONS GRID SECTION */}
                        <div className={`
                            grid gap-4 w-full flex-1 min-h-0
                            ${showPerkSelection && showSpellSelection
                                ? "grid-cols-2"
                                : "max-w-3xl mx-auto grid-cols-1"
                            }
                        `}>
                            {showPerkSelection && (
                                <div className="flex flex-col gap-y-1 overflow-y-auto pr-1 h-full">
                                    <PerkSelection bonusChoices={bonusChoicesByPerk} />
                                </div>
                            )}

                            {showSpellSelection && (
                                <div className="flex flex-col gap-y-1 overflow-y-auto pr-1 h-full">
                                    {SpellSelection}
                                </div>
                            )}
                        </div>
                    </div>
                </EditModeContextProvider>
            }
        </form>

    )
}