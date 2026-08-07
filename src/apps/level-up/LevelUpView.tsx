import { ArrowsUpFromLine } from "lucide-react"
import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { vgLiteLang } from "../../utils/lang"
import { DestructiveButton, PrimaryButton } from "../../view/component/Button"
import { getItemChoiceRules } from "../../rules/util/item-rules-util"
import { usePerkSelectionView } from "../hero-choices/PerkSelectionView"
import { SpellSelectionView } from "../hero-choices/SpellSelectionView"
import { Divider, Header } from "../../view/component/Header"
import { SkillCard } from "../../view/component/SkillCard"

export const LevelUpView = ({ actor, onSave }: {
    actor: Actor & { system: HeroDataModel },
    onSave: (isComplete?: boolean) => void
}) => {

    const nextLevel = actor.system.level.current! + 1
    const classFeature = actor.system.class.features.find(it => it.level === nextLevel)
    const levelUpChoices = getItemChoiceRules(actor.system.class.rules).filter(r => r.level === nextLevel)
    const { PerkSelectionView } = usePerkSelectionView(actor, true)
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        onSave(true)
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col grow h-full overflow-y-auto bg-sheet-main-fill p-1">
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
            {levelUpChoices.some(ch => ch.pack === 'perk') && <>
                {PerkSelectionView}
            </>}

            {/* SPELL SLOT SELECTIONS */}
            {levelUpChoices.some(ch => ch.pack === 'spell') && <>
                <Divider />
                <SpellSelectionView actor={actor} isLevelUp={true} />
            </>}

            {/* NO SELECTIONS REQUIRED */}
            {levelUpChoices.length === 0 &&
                <p className="flex justify-center m-4 text-xl text-text-primary text-justify font-eskapade font-normal">
                    No selections required.
                </p>
            }

            <Divider />

            <div className="flex justify-between mt-4">
                <DestructiveButton onClick={() => onSave()}>
                    {vgLiteLang.ButtonActions.cancel}
                </DestructiveButton>
                <PrimaryButton type="submit" icon={<ArrowsUpFromLine size={16} />}>
                    Level Up
                </PrimaryButton>
            </div>
        </form>
    )
}