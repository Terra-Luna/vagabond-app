import ContainerDataModel from "../../../../../model/item/equip/ContainerDataModel"
import EquipmentDataModel, { EquipmentSchema } from "../../../../../model/item/equip/EquipmentDataModel"
import { FoundryItem } from "../../VgLiteItemSheet"
import { EquipmentSheetBody } from "../EquipmentSheet"

export const ContainerSheet = ({ item, isEditMode }: {
    item: FoundryItem<EquipmentDataModel<EquipmentSchema>> & ContainerDataModel, isEditMode: boolean
}) => {
    return (
        <EquipmentSheetBody>
            <div>
                
            </div>
        </EquipmentSheetBody>
    )
}