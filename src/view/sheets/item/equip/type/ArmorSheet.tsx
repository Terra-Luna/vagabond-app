import ArmorDataModel from "../../../../../model/item/equip/ArmorDataModel"
import { EquipmentSheetSubtypeBody } from "../EquipmentSheet"

export const ArmorSheet = ({ item, isEditMode }: {
    item: Item & { system: ArmorDataModel }, isEditMode: boolean
}) => {
    return (
        <EquipmentSheetSubtypeBody>
            <div>
                
            </div>
        </EquipmentSheetSubtypeBody>
    )
}