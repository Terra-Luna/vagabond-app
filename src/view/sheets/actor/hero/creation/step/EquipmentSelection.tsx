import { ClassDataModel } from "../../../../../../model/item/character/ClassDataModel"
import { vgLiteLang } from "../../../../../../utils/lang"
import { Header } from "../../../../../component/Header"
import { useNavButtons } from "../../../../../context/navigation/NavButtons"

export const useEquipmentSelection = (clazz: ClassDataModel | undefined) => {
    const strings = vgLiteLang.HeroCreation
     const { NavButtons, setCanProceed } = useNavButtons()

    const EquipmentSelection = () => {
        return (
            <div className="bg-sheet-main-fill space-y-4">
                {/* HEADER AND NAVIGATION BUTTONS */}
                <NavButtons header={<Header title={strings.equipHeader} />} />

            </div>
        )
    }

    return { EquipmentSelection }
}