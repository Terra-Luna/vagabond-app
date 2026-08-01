import { ReactNode, useCallback, useEffect, useState } from "react"
import { HeroDataModel } from "../../../model/actor/HeroDataModel"
import { vgLiteLang } from "../../../utils/lang"
import { CombinedItems, getFullItem, TypedIndexEntry } from "../../../utils/modelUtil"
import { Header } from "../../../view/component/Header"
import { HeroCreationDropdown } from "../component/HeroCreationDropdown"
import { ClassDataModel } from "../../../model/item/character/ClassDataModel"
import { EditModeContextProvider } from "../../../view/context/EditModeContext/EditModeContext"
import { EditModeOptions } from "../../../view/context/EditModeContext/EditModeOptions"
import { ClassSheetReactComponent } from "../../../view/sheets/item/character/class/ClassSheetReactComponent"
import { TopNavButtons } from "../component/TopNavButtons"

export const useClassSelection = (hero: Actor & { system: HeroDataModel }, navButtons: ReactNode[]) => {
    const strings = vgLiteLang.HeroCreation

    useEffect(() => {
        CombinedItems('class').then((res) => {
            setClasses(res)
            setClassOpts(res.map(it => ({ value: it._id, label: it.name })))
            getFullItem<ClassDataModel>(res[0]).then((item) => {
                if (item) setClassItem(item)
            })
        })
    }, [])

    const [classes, setClasses] = useState<(Item | TypedIndexEntry)[]>()
    const [classOpts, setClassOpts] = useState<{ value: string | null, label: string }[]>()
    const [classItem, setClassItem] = useState<Item & { system: ClassDataModel | null }>()

    const onSelectClass = useCallback(async (selection: string) => {
        const item = await getFullItem<ClassDataModel>(classes?.find(it => it._id === selection) ?? null)
        if (item) setClassItem(item)
    }, [classes])

    const ClassSelection = () => {
        return (
            <div className="bg-sheet-main-fill space-y-4">
                <Header title={strings.class} />
                <TopNavButtons navButtons={navButtons} subtitle="" />

                <HeroCreationDropdown
                    label={strings.class}
                    value={classItem?.id ?? strings.selectClass}
                    options={classOpts ?? []}
                    onChange={onSelectClass}
                />
                {classItem &&
                    <EditModeContextProvider initialEditMode={EditModeOptions.NEVER}>
                        <ClassSheetReactComponent item={classItem} />
                    </EditModeContextProvider>
                }
            </div>
        )
    }

    return { ClassSelection, classItem }
}