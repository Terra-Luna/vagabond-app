import { HeroDataModel } from "../../../../../model/actor/HeroDataModel"
import { useNavigationContext } from "../../../../context/EditModeContext/Hooks"
import { useClassSelection } from "./component/ClassSelection"
import { useNameAndAncestry } from "./component/NameAndAncestry"

export const HeroCreator = ({ hero }: { hero: Actor & { system: HeroDataModel } }) => {
    const { currentStep } = useNavigationContext()

    const { NameAndAncestry } = useNameAndAncestry(hero)
    const { ClassSelection } = useClassSelection(hero)

    const steps = [
        <NameAndAncestry />,
        <ClassSelection />
    ]

    return (
        <div className="text-text-primary text-lg font-eskapade p-2">
            {steps[currentStep]}
        </div>
    )

}