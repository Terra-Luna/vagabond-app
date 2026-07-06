import { vgLiteLang } from "../../../../../utils/lang"
import { createDropdownEntriesFromObj } from "../../../../../utils/localeUtils"
import { DropDown } from "../../../../component/Dropdown"

export const Material = ({ item }: { item: Item & { system: { material: string } } }) => {
    return (
        <DropDown
            label={vgLiteLang.ItemSheet.material}
            value={item.system.material}
            options={createDropdownEntriesFromObj(vgLiteLang.Metals)}
            updateMechanism={{ updatePath: ['material'] }}
            parent={item}
        />
    )
}