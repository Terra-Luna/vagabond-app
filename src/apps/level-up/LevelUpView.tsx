import { ArrowsUpFromLine } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { calculateRecurringRuleEligibility, getItemChoiceRules, getRuleSelectionValues } from "../../rules/util/item-rules-util"
import { ItemsCache } from "../../rules/util/ItemsCache"
import { vgLiteLang } from "../../utils/lang"
import { createDropdownEntriesFromObj } from "../../utils/localeUtils"
import { DestructiveButton, PrimaryButton } from "../../view/component/Button"
import { Divider, Header } from "../../view/component/Header"
import { SkillCard } from "../../view/component/SkillCard"
import { usePerkSelectionView } from "../hero-choices/PerkSelectionView"
import { useSpellSelectionView } from "../hero-choices/SpellSelectionView"
import { HeroCreationDropdown } from "../hero-creator/component/HeroCreationDropdown"
import { HeroCreationLabel } from "../hero-creator/component/HeroCreationTypography"
import { usePerkBonusSelection } from "../hero-creator/step/PerkBonusSelection"
import { areLevelUpSelectionsComplete } from "./util/levelUpSelectionUtils"

export interface PerkBonusSelection {
    value: string
    ruleId: string
    selectionId?: string
}

export interface LevelUpArgs {
    levelUpStat?: string
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
    const nextLevel = actor.system.level.current! + 1
    const classFeature = actor.system.class.features
        .find(it => it.level === nextLevel || calculateRecurringRuleEligibility(nextLevel, it.level ?? 0, it.scale ?? 0))

    const levelUpChoices = getItemChoiceRules(nextLevel, actor.system.class.rules)
        .filter(r => r.level === nextLevel || calculateRecurringRuleEligibility(nextLevel, r.level, r.scale))

    const { PerkSelection, bonusChoicesByPerk, classPerkSlots, setClassPerkSlots } = usePerkSelectionView(actor, true)
    const { SpellSelection, classSpellSlots, perkSpellSlots, ancestrySpellSlots, classSpellGrants, ancestrySpellGrants } = useSpellSelectionView(actor, true)

    const perks = useMemo(() => {
        return ItemsCache.perks()
    }, [])

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
        return Object.keys(vgLiteLang.Stat).map(k => (
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

    const showPerkSelection = useMemo(() => { return levelUpChoices.some(ch => ch.pack === 'perk') }, [])

    const showBonusSelections = useMemo(() => {
        return showPerkSelection && selectedPerks.some(perk => perk?.system.rules.some(r => r.key === "ChoiceSet"))
    }, [showPerkSelection, latestPerk])

    const showSpellSelection = useMemo(() => { return levelUpChoices.some(ch => ch.pack === 'spell') }, [])

    useEffect(() => {
        resetPerkBonusSelections()
    }, [latestPerk])

    const upgradableStatsOptions = () => {
        const allOptions = [{ value: '', label: '-' }, ...createDropdownEntriesFromObj(vgLiteLang.Stat)]
        return allOptions.filter(it => it.value === '' || (stats?.find(s => s.stat === it.value)?.value ?? 0) < 7)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const isStatLevel = nextLevel % 2 === 0
        const isStatSelected = !isStatLevel || levelUpStat != null || upgradableStatsOptions().length === 1
        const isDone = areLevelUpSelectionsComplete({
            isStatLevel,
            isStatSelected,
            showBonusSelections: Boolean(showBonusSelections),
            selectedPerks,
            advancements,
            perkTrainings,
            reasonTrainings,
            spells
        })

        if (isDone) {
            onSave({
                levelUpStat: levelUpStat,
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
        else {
            ui.notifications?.warn("Complete selections to Save.")
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full bg-sheet-main-fill p-2">
            {/* HEADER WITH SAVE & CANCEL BUTTONS */}
            <div className="flex justify-between my-1">
                <DestructiveButton onClick={() => onSave({ isComplete: false })}>
                    {vgLiteLang.ButtonActions.cancel}
                </DestructiveButton>

                <p className="flex gap-x-2 items-center text-2xl text-text-primary font-eskapade font-bold">
                    <ArrowsUpFromLine size={24} className="text-wealth-denom-label" />
                    LEVEL UP
                    <ArrowsUpFromLine size={24} className="text-wealth-denom-label" />
                </p>

                <PrimaryButton type="submit" icon={<ArrowsUpFromLine size={16} />}>
                    Save & Finish
                </PrimaryButton>
            </div>

            <div className="my-1"><Divider /></div>

            {/* SCROLLABLE BODY SECTION */}
            <div className="@container flex flex-col grow h-full gap-y-2 overflow-y-auto">
                {/* NO SELECTIONS REQUIRED */}
                {levelUpChoices.length === 0 && upgradableStatsOptions().length === 1 &&
                    <p className="flex justify-center m-4 text-xl text-text-primary text-justify font-eskapade font-normal">
                        No selections required.
                    </p>
                }

                {/* CLASS FEATURE CARD */}
                {(classFeature || nextLevel % 2 === 0) &&
                    <div className="flex gap-x-2">
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
                        {nextLevel % 2 === 0 && upgradableStatsOptions().length > 1 &&
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

                <div className={`grid gap-4 w-full ${showPerkSelection && showSpellSelection
                    ? "grid-cols-2 h-[calc(100vh-200px)] overflow-y-hidden"
                    : "max-w-3xl mx-auto grid-cols-1"
                    }`}>
                    {showPerkSelection && (
                        <div className="flex flex-col gap-y-1 overflow-y-auto pr-1 h-full max-h-full">
                            <PerkSelection bonusChoices={bonusChoicesByPerk} />
                        </div>
                    )}

                    {showSpellSelection && (
                        <div className="flex flex-col gap-y-1 overflow-y-auto pr-1 h-full max-h-full">
                            {SpellSelection}
                        </div>
                    )}
                </div>

            </div>
        </form>
    )
}