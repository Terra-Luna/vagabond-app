import { ReactNode } from "react"
import { ClassDataModel } from "../../../model/item/character/ClassDataModel"
import { vgLiteLang } from "../../../utils/lang"
import { Header } from "../../../view/component/Header"
import { TopNavButtons } from "../component/TopNavButtons"
import { EditModeOptions } from "../../../view/context/EditModeContext/EditModeOptions"
import { EditModeContextProvider } from "../../../view/context/EditModeContext/EditModeContext"
import { useItemShopView } from "../../shop/ItemShopView"

export const useEquipmentSelection = (
    clazz: Item & { system: ClassDataModel } | undefined,
    navButtons: ReactNode[]
) => {
    const { ItemShop, wallet, cart, selectedPack } = useItemShopView(
        { g: 3, s: 0, c: 0 }, clazz
    )

    const strings = vgLiteLang.HeroCreation

    const EquipmentSelection = () => {
        return (
            <EditModeContextProvider initialEditMode={EditModeOptions.NEVER}>
                <div className="flex flex-col gap-y-4 h-full overflow-hidden">
                    <Header title={strings.equipHeader} />
                    <TopNavButtons navButtons={navButtons} subtitle={strings.equipSubheader} />
                    <ItemShop includeStarterPacks={true} />
                </div>
            </EditModeContextProvider >
        )
    }

    return { EquipmentSelection, wallet, cart, selectedPack }
}