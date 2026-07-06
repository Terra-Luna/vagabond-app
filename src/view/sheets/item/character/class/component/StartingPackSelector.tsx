import { ClassDataModel } from "../../../../../../model/item/character/ClassDataModel"
import { DropDown } from "../../../../../component/Dropdown"
import { useEditMode } from "../../../../../context/EditModeContext/Hooks"

export const StartingPackSelector = ({ item }: { item: Item & { system: ClassDataModel } }) => {
    const { isEditMode } = useEditMode()
    return (
        <div>
            
        </div>
    )
}