import { vgLiteLang } from "../../../../utils/lang"
import { createDropdownEntries } from "../../../../utils/localeUtils"
import { CustomDropDown } from "../../../component/Dropdown"
import { ItemSheetPropLabel } from "../equip/component/ItemSheetLabelComponent"

export const DamageTypeSelector = ({ item, path }: { item: Item, path: string }) => {
    return (
        <div className="gap-y-2 items-start">
            <ItemSheetPropLabel label={vgLiteLang.ItemSheet.damageType} />
            <CustomDropDown
                value={foundry.utils.getProperty(item, path) as string}
                options={createDropdownEntries(vgLiteLang.DamageTypes)}
                onChange={(e) => item.update({ [path]: e.target.value } as Record<string, string>)}
            />
        </div>
    )
}