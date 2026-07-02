import EquipmentDataModel, { EquipmentSchema } from "../../../../../model/item/equip/EquipmentDataModel"
import ToolDataModel from "../../../../../model/item/equip/ToolDataModel"
import { useEditMode } from "../../../../context/EditModeContext"
import { EquipmentSheetSubtypeBody } from "../EquipmentSheet"

export const ToolSheet = ({ item }: { item: Item & { system: ToolDataModel } }) => {
    const { isEditMode } = useEditMode()
    
    return (
        <EquipmentSheetSubtypeBody>
            <div>

            </div>
        </EquipmentSheetSubtypeBody>
    )
}