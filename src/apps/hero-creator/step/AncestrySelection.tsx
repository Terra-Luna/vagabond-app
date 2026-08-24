import { ReactNode, useCallback, useEffect, useState } from "react"

import { AncestryDataModel } from "../../../model/item/character/AncestryDataModel"
import { vgLiteLang } from "../../../utils/lang"
import { CombinedItems, getFullItem, TypedIndexEntry } from "../../../utils/modelUtil"
import { Header } from "../../../view/component/Header"
import { EditModeContextProvider } from "../../../view/context/EditModeContext/EditModeContext"
import { EditModeOptions } from "../../../view/context/EditModeContext/EditModeOptions"
import { AncestryReactComponent } from "../../../view/sheets/item/character/ancestry/AncestrySheetComponent"
import { HeroCreationDropdown } from "../component/HeroCreationDropdown"
import { TopNavButtons } from "../component/TopNavButtons"

export const useAncestrySelection = (navButtons: ReactNode[]) => {
    const strings = vgLiteLang.HeroCreation

    useEffect(() => {
        CombinedItems('ancestry').then((res) => {
            setAncestries(res)
            setAncestryOptions(res.map(it => ({ value: it._id, label: it.name })))
            getFullItem<AncestryDataModel>(res[0]).then((item) => {
                if (item) setAncestryItem(item)
            })
        })
    }, [])

    const [ancestries, setAncestries] = useState<(Item | TypedIndexEntry)[]>()
    const [ancestryOptions, setAncestryOptions] = useState<{ value: string | null, label: string }[]>()
    const [ancestryItem, setAncestryItem] = useState<Item & { system: AncestryDataModel | null }>()

    const onSelectAncestry = useCallback(async (selection: string) => {
        const item = await getFullItem<AncestryDataModel>(ancestries?.find(it => it._id === selection) ?? null)
        if (item) setAncestryItem(item)
    }, [ancestries])

    const AncestrySelection = (
        <div className="bg-sheet-main-fill flex flex-col h-full min-h-0 overflow-hidden">
            <div className="flex-shrink-0 space-y-4">
                <Header title={strings.identity} />
                <TopNavButtons navButtons={navButtons} canProceed={!!ancestryItem} />
            </div>
            <div className="flex-1 overflow-y-auto space-y-4">
                <div className="gap-x-4">
                    <HeroCreationDropdown
                        label={strings.selectAncestry}
                        value={ancestryItem?.id ?? strings.selectAncestry}
                        options={ancestryOptions ?? []}
                        onChange={(val) => onSelectAncestry(val)}
                    />
                </div>
                {ancestryItem &&
                    <EditModeContextProvider initialEditMode={EditModeOptions.NEVER}>
                        <AncestryReactComponent item={ancestryItem} />
                    </EditModeContextProvider>
                }
            </div>
        </div>
    )

    return { AncestrySelection, ancestryItem }
}