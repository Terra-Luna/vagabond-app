import { ClassDataModel } from "../../../../../../model/item/character/ClassDataModel"
import { ItemsCache } from "../../../../../../rules/util/ItemsCache"
import { appLang } from "../../../../../../utils/lang"
import { OptionsSelectionMenu, OptionsSelectionMenuOption } from "../../../../../component/OptionsSelectionMenu"
import { useEditMode } from "../../../../../context/EditModeContext/Hooks"
import { ClassSheetLabel, ClassSheetText } from "./ClassSheetText"

export const StartingPackSelector = ({ item }: { item: Item & { system: ClassDataModel } }) => {
    const { isEditMode } = useEditMode()

    const packs = ItemsCache.packs().map(pack => ({
        key: pack.uuid,
        value: pack.name,
        isSelected: item.system.startingPacks?.includes(pack.uuid)
    } as OptionsSelectionMenuOption))

    return (
        <div className="flex gap-x-1">

            <span className="line-clamp-1">
                <ClassSheetLabel text={`
                    ${appLang.ClassSheet.startingPacks}${packs.filter(p => p.isSelected).length > 1 ? 's' : ''}:
                `} />
            </span>

            {isEditMode &&
                <OptionsSelectionMenu
                    obj={item}
                    path={['startingPacks']}
                    options={packs}
                />
            }

            <span className="line-clamp-1">
                <ClassSheetText text={packs.filter(p => p.isSelected).map(p => p.value).join(", ")} />
            </span>
            
        </div>
    )
}