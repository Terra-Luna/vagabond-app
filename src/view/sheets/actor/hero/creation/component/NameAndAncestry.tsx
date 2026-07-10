import { useCallback, useEffect, useState } from "react"
import { HeroDataModel } from "../../../../../../model/actor/HeroDataModel"
import { vgLiteLang } from "../../../../../../utils/lang"
import { EditableTextField } from "../../../../../component/EditableTextField"
import { Header } from "../../../../../component/Header"
import { HeroCreationLabel, HeroCreationLabeledField } from "./HeroCreationTypography"
import { HeroCreationDropdown } from "./HeroCreationDropdown"
import { CombinedItems, getFullItem, TypedIndexEntry } from "../../../../../../utils/modelUtil"
import { AncestryDataModel } from "../../../../../../model/item/character/AncestryDataModel"
import { AncestryReactComponent } from "../../../../item/character/ancestry/AncestrySheetComponent"

export const useNameAndAncestry = (hero: Actor & { system: HeroDataModel }) => {
    const strings = vgLiteLang.HeroCreation

    useEffect(() => {
        CombinedItems('ancestry').then((res) => {
            setAncestries(res)
            setAncestryOptions(res.map(it => ({ value: it._id, label: it.name })))
        })
    }, [])

    const [ancestries, setAncestries] = useState<(Item | TypedIndexEntry)[]>()
    const [ancestryOptions, setAncestryOptions] = useState<{ value: string | null, label: string }[]>()
    const [ancestryItem, setAncestryItem] = useState<Item & { system: AncestryDataModel | null }>()

    const onSelectAncestry = useCallback(async (selection: string) => {
        const item = await getFullItem<AncestryDataModel>(ancestries?.find(it => it._id === selection) ?? null)
        if (item) setAncestryItem(item)
    }, [ancestryItem])

    const NameAndAncestry = () => {
        return (
            <div className="bg-sheet-main-fill space-y-4">
                <Header title={strings.identity} />
                <HeroCreationLabel text={strings.heroName} />
                <EditableTextField boundValue={hero.name} updateProps={{ object: hero, path: ['name'] }} />
                <div className="flex ga-x-2">
                    <HeroCreationDropdown
                        label={strings.selectAncestry}
                        value={ancestryItem?.name ?? strings.selectAncestry}
                        options={ancestryOptions ?? []}
                        onChange={onSelectAncestry}
                    />
                    <HeroCreationLabeledField
                        label={strings.typeSize}
                        value={`${ancestryItem?.system.beingType} / ${ancestryItem?.system.beingSize}`}
                    />
                </div>
                <AncestryReactComponent item={ancestryItem ?? null} />
            </div>
        )
    }

    return { NameAndAncestry }
}