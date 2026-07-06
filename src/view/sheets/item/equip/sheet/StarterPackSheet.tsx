import { StarterPackDataModel } from "../../../../../model/item/equip/StarterPackDataModel"
import { EquipmentSheetSubtypeBody } from "../component/EquipmentSheetSubtypeBody"

export const StarterPackSheet = ({ item }: { item: Item & { system: StarterPackDataModel } }) => {
    return (
        <EquipmentSheetSubtypeBody>
            <div>

            </div>
        </EquipmentSheetSubtypeBody>
    )
}