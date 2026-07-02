import EquipmentDataModel, { EquipmentSchema } from "../../../../../model/item/equip/EquipmentDataModel"
import ToolDataModel from "../../../../../model/item/equip/ToolDataModel"
import { EquipmentSheetSubtypeBody } from "../EquipmentSheet"

export const ToolSheet = ({ item, isEditMode }: { item: Item & { system: ToolDataModel }, isEditMode: boolean }) => {
    return (
        <EquipmentSheetSubtypeBody>
            <div>
                
            </div>
        </EquipmentSheetSubtypeBody>
    )
}