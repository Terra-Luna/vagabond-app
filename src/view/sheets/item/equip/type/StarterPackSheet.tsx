import StarterPackDataModel from "../../../../../model/item/equip/StarterPackDataModel"
import { useEditMode } from "../../../../context/EditModeContext/Hooks"
import { EquipmentSheetSubtypeBody } from "../EquipmentSheetComponent"

export const StarterPackSheet = ({ item }: { item: Item & { system: StarterPackDataModel } }) => {
    const { isEditMode } = useEditMode()

    return (
        <EquipmentSheetSubtypeBody>
            <div>

            </div>
        </EquipmentSheetSubtypeBody>
    )
}