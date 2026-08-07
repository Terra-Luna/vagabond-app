import { ArrowsUpFromLine } from "lucide-react"
import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { vgLiteLang } from "../../utils/lang"
import { DestructiveButton, PrimaryButton } from "../../view/component/Button"
import { getItemChoiceRules } from "../../rules/util/item-rules-util"
import { usePerkSelectionView } from "../hero-choices/PerkSelectionView"
import { useSpellSelectionView } from "../hero-choices/SpellSelectionView"
import { Divider, Header } from "../../view/component/Header"
import { SkillCard } from "../../view/component/SkillCard"
import { useMemo } from "react"
import { ItemsCache } from "../../rules/util/ItemsCache"
import { usePerkBonusSelection } from "../hero-creator/step/PerkBonusSelection"
import { PerkBonusSelection } from "./LevelUpApp"

export const LevelUpView = ({ actor, onSave }: {
    actor: Actor & { system: HeroDataModel },
    onSave: (args: { advancement?: PerkBonusSelection, spell?: PerkBonusSelection, perkTraining?: PerkBonusSelection, isComplete?: boolean }) => void
}) => {

    const nextLevel = actor.system.level.current! + 1
    const classFeature = actor.system.class.features.find(it => it.level === nextLevel)
    const levelUpChoices = getItemChoiceRules(actor.system.class.rules).filter(r => r.level === nextLevel)
    const { PerkSelection, classPerkSlots } = usePerkSelectionView(actor, true)
    const { SpellSelection, classSpellSlots, perkSpellSlots, ancestrySpellSlots } = useSpellSelectionView(actor, true)

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

    const { PerkBonusSelection, advancement, spell, perkTraining } = usePerkBonusSelection(
        latestPerk ? [latestPerk] : [], stats, [], trainings,
        [...ancestrySpellSlots, ...classSpellSlots, ...perkSpellSlots], []
    )

    const showPerkSelection = useMemo(() => { return levelUpChoices.some(ch => ch.pack === 'perk') }, [])

    const showBonusSelections = useMemo(() => {
        return showPerkSelection && latestPerk?.system.rules.some(r => r.key === "ChoiceSet")
    }, [showPerkSelection, latestPerk])

    const showSpellSelection = useMemo(() => { return levelUpChoices.some(ch => ch.pack === 'spell') }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const isDone =
            (!showPerkSelection && !showSpellSelection) ||
            latestPerk && (!showBonusSelections || (showBonusSelections && (advancement || spell || perkTraining)))
        if (isDone) {
            onSave({ advancement: advancement, spell: spell, perkTraining: perkTraining, isComplete: true })
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

                <p className="text-2xl text-text-primary font-eskapade font-bold">LEVEL UP</p>

                <PrimaryButton type="submit" icon={<ArrowsUpFromLine size={16} />}>
                    Save & Finish
                </PrimaryButton>
            </div>

            <div className="my-1"><Divider /></div>

            {/* SCROLLABLE BODY SECTION */}
            <div className="flex flex-col grow h-full overflow-y-auto">
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

                {/* NEW PERK SELECTION */}
                {showPerkSelection && <div className="mb-4">
                    {PerkSelection}
                </div>}

                {/* PERK BONUS SELECTIONS */}
                {showBonusSelections && <div className="mb-4">
                    {PerkBonusSelection}
                </div>}

                {/* SPELL SLOT SELECTIONS */}
                {showSpellSelection && <div className="mb-4">
                    {SpellSelection}
                </div>}

                {/* NO SELECTIONS REQUIRED */}
                {levelUpChoices.length === 0 &&
                    <p className="flex justify-center m-4 text-xl text-text-primary text-justify font-eskapade font-normal">
                        No selections required.
                    </p>
                }

            </div>
        </form>
    )
}