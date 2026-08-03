import { vgLiteLang } from "../../../../utils/lang"
import { createDropdownEntries } from "../../../../utils/localeUtils"
import { CustomDropDown } from "../../../component/Dropdown"
import { ItemSheetPropLabel } from "../equip/component/ItemSheetLabelComponent"

export const DamageTypeSelector = ({ item, path }: { item: Item, path: string }) => {
    return (
        <div>
            <ItemSheetPropLabel label={vgLiteLang.ItemSheet.damageType} />
            <div className="flex gap-x-1 items-start">
            <CustomDropDown
                value={foundry.utils.getProperty(item, path) as string}
                options={createDropdownEntries(vgLiteLang.DamageTypes)}
                onChange={(e) => item.update({ [path]: e.target.value } as Record<string, string>)}
            />
            </div>
        </div>
    )
}