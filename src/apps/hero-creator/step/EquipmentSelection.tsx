import { ClassDataModel } from "../../../model/item/character/ClassDataModel"
import { vgLiteLang } from "../../../utils/lang"
import { Header } from "../../../view/component/Header"
import { useNavButtons } from "../../../view/context/navigation/NavButtons"

export const useEquipmentSelection = (clazz: Item & { system: ClassDataModel } | undefined) => {
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