import { ReactNode } from "react"

import { ClassDataModel } from "../../../model/item/character/ClassDataModel"
import { vgLiteLang } from "../../../utils/lang"
import { Header } from "../../../view/component/Header"
import { EditModeContextProvider } from "../../../view/context/EditModeContext/EditModeContext"
import { EditModeOptions } from "../../../view/context/EditModeContext/EditModeOptions"
import { useItemShopView } from "../../shop/ItemShopView"
import { TopNavButtons } from "../component/TopNavButtons"

export const useEquipmentSelection = (
    clazz: (Item & { system: ClassDataModel }) | undefined,
    navButtons: ReactNode[]
) => {
    const { ItemShop, wallet, cart, selectedPack } = useItemShopView(
        { g: 3, s: 0, c: 0 }, clazz
    )

    const strings = vgLiteLang.HeroCreation

    const EquipmentSelection = (
        <EditModeContextProvider initialEditMode={EditModeOptions.NEVER}>
            <div className="flex flex-col h-full min-h-0 overflow-hidden">
                <div className="flex-shrink-0 space-y-4">
                    <Header title={strings.equipHeader} />
                    <TopNavButtons navButtons={navButtons} subtitle={strings.equipSubheader} canProceed={true} />
                </div>
                <div className="flex-1 overflow-y-auto">
                    <ItemShop includeStarterPacks={true} />
                </div>
            </div>
        </EditModeContextProvider >
    )

    return { EquipmentSelection, wallet, cart, selectedPack }
}