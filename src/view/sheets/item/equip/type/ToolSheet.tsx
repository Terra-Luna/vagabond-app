import ToolDataModel from "../../../../../model/item/equip/ToolDataModel"
import { EquipmentSheetSubtypeBody } from "../EquipmentSheetComponent"

export const ToolSheet = ({ item }: { item: Item & { system: ToolDataModel } }) => {
    return (
        <EquipmentSheetSubtypeBody>
            <div className="space-y-4">
                <div className="flex gap-x-4 justify-between">

                </div>
                <div className="flex justify-between items-center">

                </div>
            </div>
        </EquipmentSheetSubtypeBody>
    )
}