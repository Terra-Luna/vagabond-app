import { useCallback } from "react"
import SundryDataModel from "../../../../../model/item/equip/SundryDataModel"
import { ConsumableToggle, EquipmentSheetSubtypeBody } from "../EquipmentSheet"

export const SundrySheet = ({ item }: { item: Item & { system: SundryDataModel } }) => {
    return (
        <EquipmentSheetSubtypeBody>
            <ConsumableToggle item={item} />
        </EquipmentSheetSubtypeBody>
    )
}