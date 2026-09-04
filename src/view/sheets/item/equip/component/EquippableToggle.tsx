import { useCallback } from "react"

import { EquipmentDataModel, EquipmentSchema } from "../../../../../model/item/equip/EquipmentDataModel"
import { appLang } from "../../../../../utils/lang"
import { Checkbox } from "../../../../component/Checkbox"

export const EquippableToggle = ({ item }: { item: Item & { system: EquipmentDataModel<EquipmentSchema> } }) => {
    const onCheckEquippable = useCallback((isChecked) => {
        item.update({ 'system.isEquippable': isChecked } as Record<string, boolean>)
    }, [item])
    return (
        <Checkbox
            label={appLang.ItemSheet.equippable}
            onCheckedChanged={onCheckEquippable}
            checked={item.system.isEquippable}
        />
    )
}