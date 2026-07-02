import StarterPackDataModel from "../../../../../model/item/equip/StarterPackDataModel"
import { useEditMode } from "../../../../context/EditModeContext"
import { EquipmentSheetSubtypeBody } from "../EquipmentSheet"

export const StarterPackSheet = ({ item }: {
    item: Item & { system: StarterPackDataModel }
}) => {
    const { isEditMode } = useEditMode()

    return (
        <EquipmentSheetSubtypeBody>
            <div>

            </div>
        </EquipmentSheetSubtypeBody>
    )
}