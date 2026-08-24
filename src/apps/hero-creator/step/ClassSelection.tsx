import { ReactNode, useCallback, useEffect, useState } from "react"

import { ClassDataModel } from "../../../model/item/character/ClassDataModel"
import { vgLiteLang } from "../../../utils/lang"
import { CombinedItems, getFullItem, TypedIndexEntry } from "../../../utils/modelUtil"
import { Header } from "../../../view/component/Header"
import { EditModeContextProvider } from "../../../view/context/EditModeContext/EditModeContext"
import { EditModeOptions } from "../../../view/context/EditModeContext/EditModeOptions"
import { ClassSheetComponent } from "../../../view/sheets/item/character/class/ClassSheetComponent"
import { HeroCreationDropdown } from "../component/HeroCreationDropdown"
import { TopNavButtons } from "../component/TopNavButtons"

export const useClassSelection = (navButtons: ReactNode[]) => {
    const strings = vgLiteLang.HeroCreation

    useEffect(() => {
        CombinedItems('class').then((res) => {
            setClasses(res.sort((a, b) => a.name.localeCompare(b.name)))
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

    const ClassSelection = (
        <div className="relative bg-sheet-main-fill flex flex-col h-full min-h-0 overflow-hidden">
            <div className="flex-shrink-0 space-y-4">
                <Header title={strings.class} />
                <TopNavButtons navButtons={navButtons} subtitle="" canProceed={!!classItem} />
            </div>
            <div className="flex-1 overflow-y-auto space-y-4">
                <HeroCreationDropdown
                    label={strings.class}
                    value={classItem?.id ?? strings.selectClass}
                    options={classOpts ?? []}
                    onChange={onSelectClass}
                />
                {classItem &&
                    <EditModeContextProvider initialEditMode={EditModeOptions.NEVER}>
                        <ClassSheetComponent item={classItem} />
                    </EditModeContextProvider>
                }
            </div>
        </div>
    )

    return { ClassSelection, classItem }
}