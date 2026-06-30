import EquipmentDataModel, { EquipmentSchema } from "../../../../../model/item/equip/EquipmentDataModel"
import StarterPackDataModel from "../../../../../model/item/equip/StarterPackDataModel"
import { FoundryItem } from "../../VgLiteItemSheet"
import { EquipmentSheetBody } from "../EquipmentSheet"

export const StarterPackSheet = ({ item, isEditMode }: {
    item: FoundryItem<EquipmentDataModel<EquipmentSchema>> & StarterPackDataModel, isEditMode: boolean
}) => {
    return (
        <EquipmentSheetBody>
            <div>
                
            </div>
        </EquipmentSheetBody>
    )
}