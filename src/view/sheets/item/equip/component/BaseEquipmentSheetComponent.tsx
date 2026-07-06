import { EquipmentDataModel, EquipmentSchema } from "../../../../../model/item/equip/EquipmentDataModel"
import { Description } from "../../../shared/Description"
import { EquipmentSheetBanner } from "./EquipmentSheetBanner"

export const BaseEquipmentSheetComponent = ({ item, children }: { item: Item & { system: EquipmentDataModel<EquipmentSchema> }, children: React.ReactElement }) => {
    return (
        <div className="flex flex-col grow overflow-hidden">
            <EquipmentSheetBanner item={item} />
            <div className="flex-1 -mt-2 overflow-y-auto border-4 border-solid border-stat-block-fill/80 border-t-transparent rounded-b-md">
                <Description obj={item} />
                <div className="flex justify-between mt-2 mx-2 gap-y-4">
                    {children}
                </div>
            </div>
        </div>
    )
}