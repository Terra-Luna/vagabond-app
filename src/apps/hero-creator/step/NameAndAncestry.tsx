import { useCallback, useEffect, useState } from "react"
import { HeroDataModel } from "../../../model/actor/HeroDataModel"
import { vgLiteLang } from "../../../utils/lang"
import { EditableTextField } from "../../../view/component/EditableTextField"
import { Header } from "../../../view/component/Header"
import { AncestryDataModel } from "../../../model/item/character/AncestryDataModel"
import { AncestryReactComponent } from "../../../view/sheets/item/character/ancestry/AncestrySheetComponent"
import { EditModeContextProvider } from "../../../view/context/EditModeContext/EditModeContext"
import { EditModeOptions } from "../../../view/context/EditModeContext/EditModeOptions"
import { useNavButtons } from "../../../view/context/navigation/NavButtons"
import { CombinedItems, getFullItem, TypedIndexEntry } from "../../../utils/modelUtil"
import { HeroCreationDropdown } from "../component/HeroCreationDropdown"
import { HeroCreationLabel } from "../component/HeroCreationTypography"

export const useNameAndAncestry = (hero: Actor & { system: HeroDataModel }) => {
    const strings = vgLiteLang.HeroCreation
    const { NavButtons } = useNavButtons()

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

    const NameAndAncestry = () => {
        return (
            <div className="bg-sheet-main-fill space-y-4">
                <NavButtons header={<Header title={strings.identity} />} />
                <div>
                    <HeroCreationLabel text={strings.heroName} />
                    <EditableTextField boundValue={hero.name} updateProps={{ object: hero, path: ['name'] }} />
                </div>

                <HeroCreationDropdown
                    label={strings.selectAncestry}
                    value={ancestryItem?.id ?? strings.selectAncestry}
                    options={ancestryOptions ?? []}
                    onChange={(val) => onSelectAncestry(val)}
                />

                {
                    ancestryItem ?
                        <EditModeContextProvider initialEditMode={EditModeOptions.NEVER}>
                            <AncestryReactComponent item={ancestryItem} />
                        </EditModeContextProvider> : <></>
                }
            </div>
        )
    }

    return { NameAndAncestry, ancestryItem }
}