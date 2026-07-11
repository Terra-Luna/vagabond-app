import { AncestryDataModel } from "../../../../../../model/item/character/AncestryDataModel"
import { ClassDataModel } from "../../../../../../model/item/character/ClassDataModel"
import { vgLiteLang } from "../../../../../../utils/lang"
import { Header } from "../../../../../component/Header"
import { useNavButtons } from "../../../../../context/navigation/NavButtons"

export const useSpellSelection = (ancestry: AncestryDataModel | undefined, clazz: ClassDataModel | undefined) => {
    const strings = vgLiteLang.HeroCreation
     const { NavButtons, setCanProceed } = useNavButtons()

    const SpellSelection = () => {
        return (
            <div className="bg-sheet-main-fill space-y-4">
                {/* HEADER AND NAVIGATION BUTTONS */}
                <NavButtons header={<Header title={strings.spellsHeader} />} />

            </div>
        )
    }

    return { SpellSelection }
}