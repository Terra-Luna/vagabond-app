import { ReactNode, useCallback, useEffect, useState } from "react"

import { AncestryDataModel } from "../../../model/item/character/AncestryDataModel"
import { vgLiteLang } from "../../../utils/lang"
import { CombinedItems, getFullItem, TypedIndexEntry } from "../../../utils/modelUtil"
import { Checkbox } from "../../../view/component/Checkbox"
import { Header } from "../../../view/component/Header"
import { EditModeContextProvider } from "../../../view/context/EditModeContext/EditModeContext"
import { EditModeOptions } from "../../../view/context/EditModeContext/EditModeOptions"
import { AncestryReactComponent } from "../../../view/sheets/item/character/ancestry/AncestrySheetComponent"
import { HeroCreationDropdown } from "../component/HeroCreationDropdown"
import { TopNavButtons } from "../component/TopNavButtons"

export const useAncestrySelection = (navButtons: ReactNode[]) => {

    useEffect(() => {
        CombinedItems('ancestry').then((res) => {
            const sortedAncestries = res.sort((a, b) => a.name.localeCompare(b.name))
            setAncestries(sortedAncestries)
            setAncestryOptions([
                { value: null, label: " -- Select your Ancestry -- " },
                ...sortedAncestries.map(it => ({ value: it._id, label: it.name }))
            ])
        })
    }, [])

    const [levelZero, setLevelZero] = useState(false)
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
                <Header title={vgLiteLang.HeroCreation.identity} />
                <TopNavButtons navButtons={navButtons} canProceed={!!ancestryItem} />
            </div>
            <div className="flex-1 overflow-y-auto space-y-4">
                <div className="flex gap-x-16 items-end">
                    <HeroCreationDropdown
                        label={vgLiteLang.HeroCreation.selectAncestry}
                        value={ancestryItem?.id ?? vgLiteLang.HeroCreation.selectAncestry}
                        options={ancestryOptions ?? []}
                        onChange={(val) => onSelectAncestry(val)}
                    />

                    {/* LEVEL ZERO START TOGGLE */}
                    <Checkbox
                        label={"Start at Level 0"}
                        checked={levelZero}
                        onCheckedChanged={(val) => setLevelZero(val)}
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

    return { AncestrySelection, ancestryItem, levelZero }
}