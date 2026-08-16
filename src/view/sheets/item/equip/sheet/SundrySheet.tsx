import { SundryDataModel } from "../../../../../model/item/equip/SundryDataModel"
import { ConsumableToggle } from "../component/ConsumableItemToggleComponent"
import { EquipmentSheetSubtypeBody } from "../component/EquipmentSheetSubtypeBody"
import { EquippableToggle } from "../component/EquippableToggle"

export const SundrySheet = ({ item }: { item: Item & { system: SundryDataModel } }) => {
    return (
        <EquipmentSheetSubtypeBody>
            <div>
                <ConsumableToggle item={item} />
                <EquippableToggle item={item} />
            </div>
        </EquipmentSheetSubtypeBody>
    )
}