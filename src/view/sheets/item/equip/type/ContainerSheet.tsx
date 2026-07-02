import ContainerDataModel from "../../../../../model/item/equip/ContainerDataModel"
import { useEditMode } from "../../../../context/EditModeContext"
import { EquipmentSheetSubtypeBody } from "../EquipmentSheet"

export const ContainerSheet = ({ item }: {
    item: Item & { system: ContainerDataModel }
}) => {
    const { isEditMode } = useEditMode()

    return (
        <EquipmentSheetSubtypeBody>
            <div>

            </div>
        </EquipmentSheetSubtypeBody>
    )
}