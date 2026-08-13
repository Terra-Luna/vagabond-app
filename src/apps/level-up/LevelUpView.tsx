import { ArrowsUpFromLine } from "lucide-react"
import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { vgLiteLang } from "../../utils/lang"
import { DestructiveButton, PrimaryButton } from "../../view/component/Button"
import { calculateRecurringRuleEligibility, getItemChoiceRules } from "../../rules/util/item-rules-util"
import { usePerkSelectionView } from "../hero-choices/PerkSelectionView"
import { useSpellSelectionView } from "../hero-choices/SpellSelectionView"
import { Divider, Header } from "../../view/component/Header"
import { SkillCard } from "../../view/component/SkillCard"
import { useEffect, useMemo } from "react"
import { ItemsCache } from "../../rules/util/ItemsCache"
import { usePerkBonusSelection } from "../hero-creator/step/PerkBonusSelection"
import { PerkBonusSelection } from "./LevelUpApp"

export const LevelUpView = ({ actor, onSave }: {
    actor: Actor & { system: HeroDataModel },
    onSave: (args: { advancement?: PerkBonusSelection, spell?: PerkBonusSelection, perkTraining?: PerkBonusSelection, isComplete?: boolean }) => void
}) => {

    const nextLevel = actor.system.level.current! + 1
    const classFeature = actor.system.class.features
        .find(it => it.level === nextLevel || calculateRecurringRuleEligibility(nextLevel, it.level ?? 0, it.scale ?? 0))

    const levelUpChoices = getItemChoiceRules(nextLevel, actor.system.class.rules)
        .filter(r => r.level === nextLevel || calculateRecurringRuleEligibility(nextLevel, r.level, r.scale))

    const { PerkSelection, classPerkSlots, setClassPerkSlots } = usePerkSelectionView(actor, true)
    const { SpellSelection, classSpellSlots, perkSpellSlots, ancestrySpellSlots, classSpellGrants, ancestrySpellGrants } = useSpellSelectionView(actor, true)

    const perks = useMemo(() => {
        return ItemsCache.perks()
    }, [])

    const latestPerk = useMemo(() => {
        const latestSelection = [...classPerkSlots].reverse()[0]
        const perk = perks.find(p => p.uuid === latestSelection?.value)
        return perk
    }, [classPerkSlots])

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

    const { PerkBonusSelection, advancement, spell, perkTraining, resetPerkBonusSelections } = usePerkBonusSelection(
        latestPerk ? [latestPerk] : [], stats, [], trainings,
        [...ancestrySpellSlots, ...classSpellSlots, ...perkSpellSlots],
        classSpellGrants, ancestrySpellGrants, []
    )

    const showPerkSelection = useMemo(() => { return levelUpChoices.some(ch => ch.pack === 'perk') }, [])

    const showBonusSelections = useMemo(() => {
        return showPerkSelection && latestPerk?.system.rules.some(r => r.key === "ChoiceSet")
    }, [showPerkSelection, latestPerk])

    const showSpellSelection = useMemo(() => { return levelUpChoices.some(ch => ch.pack === 'spell') }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const noSelectionsRequired = !showPerkSelection && !showSpellSelection
        const isBonusSelectionMade = (!showBonusSelections || (showBonusSelections && (advancement || spell || perkTraining)))
        const isDone = noSelectionsRequired || (latestPerk && isBonusSelectionMade)
        if (isDone) {
            setClassPerkSlots(classPerkSlots.map(slot => ({ ...slot, isLocked: true })))
            onSave({ advancement: advancement, spell: spell, perkTraining: perkTraining, isComplete: true })
        }
        else {
            ui.notifications?.warn("Complete selections to Save.")
        }
    }

    useEffect(() => {
        resetPerkBonusSelections()
    }, [latestPerk])

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full bg-sheet-main-fill p-2">
            {/* HEADER WITH SAVE & CANCEL BUTTONS */}
            <div className="flex justify-between my-1">
                <DestructiveButton onClick={() => onSave({ isComplete: false })}>
                    {vgLiteLang.ButtonActions.cancel}
                </DestructiveButton>

                <p className="text-2xl text-text-primary font-eskapade font-bold">LEVEL UP</p>

                <PrimaryButton type="submit" icon={<ArrowsUpFromLine size={16} />}>
                    Save & Finish
                </PrimaryButton>
            </div>

            <div className="my-1"><Divider /></div>

            {/* SCROLLABLE BODY SECTION */}
            <div className="@container flex flex-col grow h-full overflow-y-auto">
                {/* CLASS FEATURE CARD */}
                {classFeature &&
                    <div className="space-y-1">
                        <Header title={"CLASS FEATURE"} />
                        <SkillCard
                            title={classFeature.name}
                            subtitles={[{ label: "Level", value: classFeature.level }]}
                            description={classFeature.description}
                            startCollapsed={false}
                        />
                    </div>
                }

                {/* NO SELECTIONS REQUIRED */}
                {levelUpChoices.length === 0 &&
                    <p className="flex justify-center m-4 text-xl text-text-primary text-justify font-eskapade font-normal">
                        No selections required.
                    </p>
                }

                <div className={`grid gap-4 w-full ${showPerkSelection && showSpellSelection
                    ? "grid-cols-2 h-[calc(100vh-200px)] overflow-y-hidden"
                    : "max-w-3xl mx-auto grid-cols-1"
                    }`}>
                    {showPerkSelection && (
                        <div className="flex flex-col gap-y-1 overflow-y-auto pr-1 h-full max-h-full">
                            {/* PERK BONUS SELECTIONS */}
                            {showBonusSelections && (
                                <div className="w-full">
                                    {PerkBonusSelection}
                                </div>
                            )}

                            {PerkSelection}
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