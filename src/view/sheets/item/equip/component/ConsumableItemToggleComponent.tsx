import { useCallback } from "react"

import { EquipmentDataModel, EquipmentSchema } from "../../../../../model/item/equip/EquipmentDataModel"
import { appLang } from "../../../../../utils/lang"
import { Checkbox } from "../../../../component/Checkbox"

export const ConsumableToggle = ({ item }: { item: Item & { system: EquipmentDataModel<EquipmentSchema> } }) => {
    const onCheckConsumable = useCallback((isChecked) => {
        item.update({ 'system.isConsumable': isChecked } as Record<string, boolean>)
    }, [item])
    return (
        <Checkbox
            label={appLang.ItemSheet.consumable}
            onCheckedChanged={onCheckConsumable}
            checked={item.system.isConsumable}
        />
    )
}