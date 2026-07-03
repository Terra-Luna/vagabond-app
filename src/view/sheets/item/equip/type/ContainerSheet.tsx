import { VGLITE as lang } from "../../../../../../public/lang/en.json"
import { containerItemContextMenuItems } from "../../../../../model/actor/type/Inventory"
import ContainerDataModel, { containerItems } from "../../../../../model/item/equip/ContainerDataModel"
import { EditableTextField } from "../../../../component/EditableTextField"
import { useEditMode } from "../../../../context/EditModeContext"
import { CapacityGauge } from "../../../shared/CapacityGauge"
import { InventoryItemsTable } from "../../../shared/InventoryItemsTable"
import { EquipmentSheetSubtypeBody, ItemSheetProperty } from "../EquipmentSheet"

export const ContainerSheet = ({ item }: { item: Item & { system: ContainerDataModel } }) => {
    const { isEditMode } = useEditMode()

    console.log(item.actor)

    return (
        <EquipmentSheetSubtypeBody>
            <div className="space-y-8 mb-8">
                <div className="flex gap-x-4 justify-start items-center">
                    {
                        isEditMode ?
                            <ItemSheetProperty
                                label={lang.ItemSheet.capacity}
                                value={
                                    <EditableTextField
                                        boundValue={item.system.capacity.toString()}
                                        updateProps={{ object: item, path: ['capacity'] }}
                                        placeholder={"2"}
                                    />
                                }
                            /> : <></>
                    }
                    <CapacityGauge label={lang.ItemSheet.capacity} capacityInfo={{
                        bulk: (item.system.capacity - item.system.emptySlots),
                        capacity: item.system.capacity,
                        isOverEncumbered: false
                    }} />
                </div>
                <InventoryItemsTable
                    actor={item.actor}
                    items={containerItems(item.system).map(it => it.system)}
                    contextMenuItems={(targetItem) => {
                        console.log(targetItem)
                        containerItemContextMenuItems(item.actor?.system, targetItem, item)
                    }}
                />
            </div>
        </EquipmentSheetSubtypeBody>
    )
}