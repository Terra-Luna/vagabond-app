import ArmorDataModel from "../../../../../model/item/equip/ArmorDataModel"
import { useEditMode } from "../../../../context/EditModeContext"
import { EquipmentSheetSubtypeBody } from "../EquipmentSheet"

export const ArmorSheet = ({ item }: { item: Item & { system: ArmorDataModel } }) => {
    const { isEditMode } = useEditMode()

    return (
        <EquipmentSheetSubtypeBody>
            <div>

            </div>
        </EquipmentSheetSubtypeBody>
    )
}