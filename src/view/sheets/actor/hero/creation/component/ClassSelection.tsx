import { HeroDataModel } from "../../../../../../model/actor/HeroDataModel"
import { vgLiteLang } from "../../../../../../utils/lang"
import { Header } from "../../../../../component/Header"
import { useNavButtons } from "./NavButtons"

export const useClassSelection = (hero: Actor & { system: HeroDataModel }) => {
    const strings = vgLiteLang.HeroCreation
    const { NavButtons } = useNavButtons()

    const ClassSelection = () => {
        return (
            <div className="bg-sheet-main-fill space-y-4">
                <NavButtons header={<Header title={strings.class} />} />
            </div>
        )
    }

    return { ClassSelection }
}