import ContainerDataModel from "../../../../../model/item/equip/ContainerDataModel"
import { EquipmentSheetSubtypeBody } from "../EquipmentSheet"

export const ContainerSheet = ({ item, isEditMode }: {
    item: Item & { system: ContainerDataModel }, isEditMode: boolean
}) => {
    return (
        <EquipmentSheetSubtypeBody>
            <div>
                
            </div>
        </EquipmentSheetSubtypeBody>
    )
}