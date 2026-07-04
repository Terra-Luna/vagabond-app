import ActorDataModel, { BaseActorSchema } from "../../../../../model/actor/ActorDataModel"
import { sortedItems, containerItemContextMenuItems } from "../../../../../model/actor/type/Inventory"
import ContainerDataModel, { containerItems } from "../../../../../model/item/equip/ContainerDataModel"
import EquipmentDataModel, { EquipmentSchema } from "../../../../../model/item/equip/EquipmentDataModel"
import { vgLiteLang as lang, vgLiteLang } from "../../../../../utils/lang"
import { EditableTextField } from "../../../../component/EditableTextField"
import { useEditMode } from "../../../../context/EditModeContext/Hooks"
import { CapacityGauge } from "../../../shared/CapacityGauge"
import { InventoryItemsTable } from "../../../shared/InventoryItemsTable"
import { EquipmentSheetSubtypeBody, ItemSheetProperty } from "../EquipmentSheetComponent"

export const ContainerSheet = ({ item }: { item: Item & { system: ContainerDataModel } }) => {
    const { isEditMode } = useEditMode()
    const owner = item?.actor?.system as ActorDataModel<BaseActorSchema> | null
    const contents = sortedItems<EquipmentDataModel<EquipmentSchema>>(containerItems(item.system).map(it => it.system))
    return (
        <EquipmentSheetSubtypeBody>
            <div className="mb-8">
                <div className="flex gap-x-4 justify-center items-center mb-2">
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
                {
                    contents.length === 0 ?
                        <p className="italic">{vgLiteLang.ItemSheet.drag}</p> :
                        <InventoryItemsTable
                            actor={owner}
                            items={contents}
                            contextMenuItems={(targetItem) => containerItemContextMenuItems(owner, targetItem, item.system)}
                            showEquipColumn={false}
                        />
                }
            </div>
        </EquipmentSheetSubtypeBody>
    )
}