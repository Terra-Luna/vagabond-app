import { vgLiteLang } from "../../../../utils/lang"
import { createDropdownEntries } from "../../../../utils/localeUtils"
import { DamageTypeIcon } from "../../../component/DamageTypeIcon"
import { CustomDropDown } from "../../../component/Dropdown"
import { useEditMode } from "../../../context/EditModeContext/Hooks"
import { ItemSheetPropLabel } from "../equip/component/ItemSheetLabelComponent"

export const DamageTypeSelector = ({ item, path }: { item: Item, path: string }) => {
    const { isEditMode } = useEditMode()
    return (
        <div>
            <ItemSheetPropLabel label={vgLiteLang.ItemSheet.damageType} />
            <div className="flex gap-x-1 items-center">
                <CustomDropDown
                    value={foundry.utils.getProperty(item, path) as string}
                    options={createDropdownEntries(vgLiteLang.DamageTypes)}
                    onChange={(e) => item.update({ [path]: e.target.value } as Record<string, string>)}
                />
                {!isEditMode && <DamageTypeIcon dmgType={foundry.utils.getProperty(item, path) as string} />}
            </div>
        </div>
    )
}