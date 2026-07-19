import { ReactNode } from "react"
import { ClassDataModel } from "../../../model/item/character/ClassDataModel"
import { vgLiteLang } from "../../../utils/lang"
import { Header } from "../../../view/component/Header"
import { TopNavButtons } from "../component/TopNavButtons"

export const useEquipmentSelection = (
    clazz: Item & { system: ClassDataModel } | undefined,
    navButtons: ReactNode[]
) => {
    const strings = vgLiteLang.HeroCreation

    const EquipmentSelection = () => {
        return (
            <div className="bg-sheet-main-fill space-y-4">
                <Header title={strings.equipHeader} />
                <TopNavButtons navButtons={navButtons} />
            </div>
        )
    }

    return { EquipmentSelection }
}