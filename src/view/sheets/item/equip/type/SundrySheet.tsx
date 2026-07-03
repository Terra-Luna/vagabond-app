import SundryDataModel from "../../../../../model/item/equip/SundryDataModel"
import { EquipmentSheetSubtypeBody, ConsumableToggle } from "../EquipmentSheetComponent"

export const SundrySheet = ({ item }: { item: Item & { system: SundryDataModel } }) => {
    return (
        <EquipmentSheetSubtypeBody>
            <ConsumableToggle item={item} />
        </EquipmentSheetSubtypeBody>
    )
}