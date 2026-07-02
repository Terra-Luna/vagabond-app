import AlchemicalItemDataModel from "../../../../../model/item/equip/AlchemicalDataModel"
import { EquipmentSheetSubtypeBody } from "../EquipmentSheet"

export const AlchemicalSheet = ({ item, isEditMode }: {
    item: Item & { system: AlchemicalItemDataModel }, isEditMode: boolean
}) => {
    return (
        <EquipmentSheetSubtypeBody>
            <div>
                
            </div>
        </EquipmentSheetSubtypeBody>
    )
}