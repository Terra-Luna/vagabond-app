import StarterPackDataModel from "../../../../../model/item/equip/StarterPackDataModel"
import { EquipmentSheetSubtypeBody } from "../EquipmentSheet"

export const StarterPackSheet = ({ item, isEditMode }: {
    item: Item & { system: StarterPackDataModel }, isEditMode: boolean
}) => {
    return (
        <EquipmentSheetSubtypeBody>
            <div>
                
            </div>
        </EquipmentSheetSubtypeBody>
    )
}