import { useCallback } from "react"
import { VGLITE as lang } from "../../../../../../public/lang/en.json"
import SundryDataModel from "../../../../../model/item/equip/SundryDataModel"
import { Checkbox } from "../../../../component/Checkbox"
import { EquipmentSheetSubtypeBody, ItemSheetProperty } from "../EquipmentSheet"

export const SundrySheet = ({ item, isEditMode }: {
    item: Item & { system: SundryDataModel }, isEditMode: boolean
}) => {
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