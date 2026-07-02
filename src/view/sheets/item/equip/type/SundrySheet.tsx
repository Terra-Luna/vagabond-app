import { useCallback } from "react"
import { VGLITE as lang } from "../../../../../../public/lang/en.json"
import SundryDataModel from "../../../../../model/item/equip/SundryDataModel"
import { Checkbox } from "../../../../component/Checkbox"
import { EquipmentSheetSubtypeBody, ItemSheetProperty } from "../EquipmentSheet"
import { useEditMode } from "../../../../context/EditModeContext"

export const SundrySheet = ({ item }: {
    item: Item & { system: SundryDataModel }
}) => {
    const { isEditMode } = useEditMode()

    const onCheckConsumable = useCallback((isChecked) => {
        item.update({ 'system.isConsumable': isChecked } as Record<string, boolean>)
    }, [item])
    return (
        <EquipmentSheetSubtypeBody>
            <ItemSheetProperty label={lang.ItemSheet.consumable} value={
                <Checkbox
                    label=''
                    onCheckedChanged={onCheckConsumable}
                    checked={item.system.isConsumable}
                    isGlobalEditMode={isEditMode}
                />
            } />
        </EquipmentSheetSubtypeBody>
    )
}