import { vgLiteLang } from "../../../../../utils/lang"
import { createDropdownEntries } from "../../../../../utils/localeUtils"
import { DropDown } from "../../../../component/Dropdown"

export const CategorySelection = ({ item }) => {
    return (
        <DropDown
            label={vgLiteLang.ItemSheet.category}
            value={item.system.category}
            options={createDropdownEntries(vgLiteLang.EquipmentCategories)}
            updateMechanism={{ updatePath: ['category'] }}
            parent={item}
        />
    )
}