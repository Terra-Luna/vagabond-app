import { useCallback } from "react"
import { EquipmentDataModel, EquipmentSchema } from "../../../../../model/item/equip/EquipmentDataModel"
import { Checkbox } from "../../../../component/Checkbox"
import { vgLiteLang } from "../../../../../utils/lang"

export const ConsumableToggle = ({ item }: { item: Item & { system: EquipmentDataModel<EquipmentSchema> } }) => {
    const onCheckConsumable = useCallback((isChecked) => {
        item.update({ 'system.isConsumable': isChecked } as Record<string, boolean>)
    }, [item])
    return (
        <Checkbox
            label={vgLiteLang.ItemSheet.consumable}
            onCheckedChanged={onCheckConsumable}
            checked={item.system.isConsumable}
        />
    )
}