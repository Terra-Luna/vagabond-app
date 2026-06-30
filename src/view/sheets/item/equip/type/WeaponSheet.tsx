import EquipmentDataModel, { EquipmentSchema } from "../../../../../model/item/equip/EquipmentDataModel"
import WeaponDataModel from "../../../../../model/item/equip/WeaponDataModel"
import { FoundryItem } from "../../VgLiteItemSheet"
import { EquipmentSheetBody } from "../EquipmentSheet"

export const WeaponSheet = ({ item, isEditMode }: { 
    item: FoundryItem<EquipmentDataModel<EquipmentSchema>> & WeaponDataModel, isEditMode: boolean
}) => {
    return (
        <EquipmentSheetBody>
            <div>
                asd;flkjasd;flkasdf
            </div>
        </EquipmentSheetBody>
    )
}