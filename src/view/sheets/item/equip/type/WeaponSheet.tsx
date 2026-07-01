import { VGLITE as lang } from "../../../../../../public/lang/en.json"
import EquipmentDataModel, { EquipmentSchema } from "../../../../../model/item/equip/EquipmentDataModel"
import WeaponDataModel from "../../../../../model/item/equip/WeaponDataModel"
import { FoundryItem } from "../../VgLiteItemSheet"
import { EquipmentSheetBody, ItemSheetProperty } from "../EquipmentSheet"

export const WeaponSheet = ({ item, isEditMode }: { 
    item: FoundryItem<EquipmentDataModel<EquipmentSchema>> & WeaponDataModel, isEditMode: boolean
}) => {
    return (
        <EquipmentSheetBody><>
            <ItemSheetProperty label={lang.ItemSheet.grip} value={undefined} />
            <ItemSheetProperty label={undefined} value={undefined} />
            <ItemSheetProperty label={undefined} value={undefined} />
            <ItemSheetProperty label={undefined} value={undefined} />
        </></EquipmentSheetBody>
    )
}