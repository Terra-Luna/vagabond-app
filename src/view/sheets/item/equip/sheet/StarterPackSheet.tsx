import { StarterPackDataModel } from "../../../../../model/item/equip/StarterPackDataModel"
import { EquipmentSheetSubtypeBody } from "../component/EquipmentSheetSubtypeBody"

export const StarterPackSheet = ({ item }: { item: Item & { system: StarterPackDataModel } }) => {
    console.log("Starter pack sheet")
    return (
        <EquipmentSheetSubtypeBody>
            <div>

            </div>
        </EquipmentSheetSubtypeBody>
    )
}