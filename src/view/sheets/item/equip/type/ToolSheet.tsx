import EquipmentDataModel, { EquipmentSchema } from "../../../../../model/item/equip/EquipmentDataModel"
import ToolDataModel from "../../../../../model/item/equip/ToolDataModel"
import { FoundryItem } from "../../VgLiteItemSheet"
import { EquipmentSheetBody } from "../EquipmentSheet"

export const ToolSheet = ({ item, isEditMode }: {
    item: FoundryItem<EquipmentDataModel<EquipmentSchema>> & ToolDataModel, isEditMode: boolean
}) => {
    return (
        <EquipmentSheetBody>
            <div>
                
            </div>
        </EquipmentSheetBody>
    )
}