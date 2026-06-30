import ArmorDataModel from "../../../../../model/item/equip/ArmorDataModel"
import EquipmentDataModel, { EquipmentSchema } from "../../../../../model/item/equip/EquipmentDataModel"
import { FoundryItem } from "../../VgLiteItemSheet"
import { EquipmentSheetBody } from "../EquipmentSheet"

export const ArmorSheet = ({ item, isEditMode }: {
    item: FoundryItem<EquipmentDataModel<EquipmentSchema>> & ArmorDataModel, isEditMode: boolean
}) => {
    return (
        <EquipmentSheetBody>
            <div>
                
            </div>
        </EquipmentSheetBody>
    )
}