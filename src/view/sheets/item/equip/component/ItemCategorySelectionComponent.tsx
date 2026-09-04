import { appLang } from "../../../../../utils/lang"
import { createDropdownEntries } from "../../../../../utils/localeUtils"
import { DropDown } from "../../../../component/Dropdown"

export const CategorySelection = ({ item }) => {
    return (
        <DropDown
            label={appLang.ItemSheet.category}
            value={item.system.category}
            options={createDropdownEntries(appLang.EquipmentCategories)}
            updateMechanism={{ updatePath: ['category'] }}
            parent={item}
        />
    )
}