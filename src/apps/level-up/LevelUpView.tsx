import { ArrowsUpFromLine } from "lucide-react"
import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { vgLiteLang } from "../../utils/lang"
import { DestructiveButton, PrimaryButton } from "../../view/component/Button"
import { getItemChoiceRules } from "../../rules/util/item-rules-util"
import { PerkSelectionView } from "../hero-choices/PerkSelectionView"
import { SpellSelectionView } from "../hero-choices/SpellSelectionView"
import { Divider } from "../../view/component/Header"
import { useMemo } from "react"

export const LevelUpView = ({ actor, onSave }: {
    actor: Actor & { system: HeroDataModel },
    onSave: (isComplete?: boolean) => void
}) => {

    const nextLevel = actor.system.level.current! + 1
    const levelUpChoices = getItemChoiceRules(actor.system.class.rules).filter(r => r.level === nextLevel)
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        onSave(true)
    }

    const perkSelections = useMemo(() => {
        return actor.system.class.rules.filter(it => it.key === "ChoiceSet" && it.pack === 'perk').flatMap(it => it.selections)
    }, [actor.system.class.rules])

    return (
        <form onSubmit={handleSubmit} className="flex flex-col grow h-full overflow-y-auto bg-sheet-main-fill">
            {levelUpChoices.length === 0 &&
                <p className="flex justify-center text-xl text-text-primary text-justify font-eskapade font-normal">
                    No selections required.
                </p>
            }

            {levelUpChoices.some(ch => ch.pack === 'perk') &&
                <PerkSelectionView actor={actor} isLevelUp={true} />
            }

            <Divider />

            {levelUpChoices.some(ch => ch.pack === 'spell') &&
                <SpellSelectionView actor={actor} isLevelUp={true} />
            }

            <Divider />

            <div className="flex justify-between mt-4 pb-4 px-2">
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