import { ClassDataModel } from "../../../../../../model/item/character/ClassDataModel"
import { appLang } from "../../../../../../utils/lang"
import { OptionsSelectionMenu } from "../../../../../component/OptionsSelectionMenu"
import { useEditMode } from "../../../../../context/EditModeContext/Hooks"
import { ClassSheetLabel, ClassSheetText } from "./ClassSheetText"

export const KeyStatsSelector = ({ item }: { item: Item & { system: ClassDataModel } }) => {
    const { isEditMode } = useEditMode()
    return (
        <div className="flex gap-x-1">
            <ClassSheetLabel text={`${appLang.ClassSheet.labelKeyStats}:`} />
            {isEditMode && <StatsSelector item={item} />}
            <ClassSheetText text={item.system.keyStats.map(it => appLang.Stat[it].name).join(", ")} />
        </div>
    )
}

const StatsSelector = ({ item }: { item: Item & { system: ClassDataModel } }) => {
    return (
        <div className="mt-1 -ml-1 mr-1">
            <OptionsSelectionMenu
                obj={item}
                path={['keyStats']}
                options={
                    Object.keys(appLang.Stat).map(k => (
                        { key: k, value: appLang.Stat[k].name, isSelected: item.system.keyStats.includes(k) }
                    ))
                }
            />
        </div>
    )
}