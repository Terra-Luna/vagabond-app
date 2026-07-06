import { SundryDataModel } from "../../../../../model/item/equip/SundryDataModel"
import { ConsumableToggle } from "../component/ConsumableItemToggleComponent"
import { EquipmentSheetSubtypeBody } from "../component/EquipmentSheetSubtypeBody"

export const SundrySheet = ({ item }: { item: Item & { system: SundryDataModel } }) => {
    return (
        <EquipmentSheetSubtypeBody>
            <ConsumableToggle item={item} />
        </EquipmentSheetSubtypeBody>
    )
}