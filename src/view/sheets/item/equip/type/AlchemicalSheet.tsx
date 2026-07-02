import AlchemicalItemDataModel from "../../../../../model/item/equip/AlchemicalDataModel"
import { useEditMode } from "../../../../context/EditModeContext"
import { EquipmentSheetSubtypeBody } from "../EquipmentSheet"

export const AlchemicalSheet = ({ item }: {
    item: Item & { system: AlchemicalItemDataModel }
}) => {
    const { isEditMode } = useEditMode()
    return (
        <EquipmentSheetSubtypeBody>
            <div>

            </div>
        </EquipmentSheetSubtypeBody>
    )
}