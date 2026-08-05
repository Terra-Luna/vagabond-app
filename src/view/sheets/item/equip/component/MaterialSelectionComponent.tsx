import { vgLiteLang } from "../../../../../utils/lang"
import { createDropdownEntriesFromObj } from "../../../../../utils/localeUtils"
import { CustomDropDown } from "../../../../component/Dropdown"
import { useEditMode } from "../../../../context/EditModeContext/Hooks"
import { ItemSheetPropLabel } from "./ItemSheetLabelComponent"

export const MaterialSelection = ({ item }: { item: Item & { system: { material: string } } }) => {
    const { isEditMode } = useEditMode()
    return (
        <div>
            {(isEditMode || item.system.material !== 'none') && (
                <>
                    <ItemSheetPropLabel label={vgLiteLang.ItemSheet.material} />
                    <div className="flex gap-x-1 items-start">
                        <CustomDropDown
                            value={item.system.material}
                            options={createDropdownEntriesFromObj(vgLiteLang.Metals)}
                            onChange={(e) => item.update({ 'system.material': e.target.value } as Record<string, string>)}
                        />
                    </div>
                </>
            )}
        </div>
    )
}