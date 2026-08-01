import { vgLiteLang } from "../../../../utils/lang"
import { createDropdownEntries } from "../../../../utils/localeUtils"
import { DropDown } from "../../../component/Dropdown"
import { ItemSheetPropLabel } from "../equip/component/ItemSheetLabelComponent"

export const DamageTypeSelector = ({ item, path }: { item: Item, path: string }) => {
    return (
        <div className="gap-y-4">
            <ItemSheetPropLabel label={vgLiteLang.ItemSheet.damageType} />
            <DropDown
                value={foundry.utils.getProperty(item, path) as string}
                options={createDropdownEntries(vgLiteLang.DamageTypes)}
                updateMechanism={{ updatePath: path.split('.') }}
                parent={item}
            />
        </div>
    )
}