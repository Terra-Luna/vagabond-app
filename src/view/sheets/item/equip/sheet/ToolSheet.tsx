import { ToolDataModel } from "../../../../../model/item/equip/ToolDataModel"
import { EquipmentSheetSubtypeBody } from "../component/EquipmentSheetSubtypeBody"

export const ToolSheet = ({ item }: { item: Item & { system: ToolDataModel } }) => {
    return (
        <EquipmentSheetSubtypeBody>
            <div>
                
            </div>
        </EquipmentSheetSubtypeBody>
    )
}