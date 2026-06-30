import AlchemicalItemDataModel from "../../../../../model/item/equip/AlchemicalDataModel"
import EquipmentDataModel, { EquipmentSchema } from "../../../../../model/item/equip/EquipmentDataModel"
import { FoundryItem } from "../../VgLiteItemSheet"
import { EquipmentSheetBody } from "../EquipmentSheet"

export const AlchemicalSheet = ({ item, isEditMode }: {
    item: FoundryItem<EquipmentDataModel<EquipmentSchema>> & AlchemicalItemDataModel, isEditMode: boolean
}) => {
    return (
        <EquipmentSheetBody>
            <div>
                
            </div>
        </EquipmentSheetBody>
    )
}