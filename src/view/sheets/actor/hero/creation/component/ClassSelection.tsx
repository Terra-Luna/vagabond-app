import { HeroDataModel } from "../../../../../../model/actor/HeroDataModel"
import { vgLiteLang } from "../../../../../../utils/lang"
import { Header } from "../../../../../component/Header"
import { useNavigationContext } from "../../../../../context/EditModeContext/Hooks"
import { useNavButtons } from "./NavButtons"

export const useClassSelection = (hero: Actor & { system: HeroDataModel }) => {
    const strings = vgLiteLang.HeroCreation
    const { onNext, onBack } = useNavigationContext()
    const { NavButtons } = useNavButtons(onBack, onNext)

    const ClassSelection = () => {
        return (
            <div className="bg-sheet-main-fill space-y-4">
                <NavButtons header={<Header title={strings.class} />} />
            </div>
        )
    }

    return { ClassSelection }
}