import { Undo } from "lucide-react"
import { ActorDataModel, BaseActorSchema } from "../../../../../model/actor/ActorDataModel"
import { sortedItems, containerItemContextMenuItems } from "../../../../../model/actor/type/Inventory"
import { ContainerDataModel, itemsInContainer } from "../../../../../model/item/equip/ContainerDataModel"
import { EquipmentDataModel, EquipmentSchema } from "../../../../../model/item/equip/EquipmentDataModel"
import { vgLiteLang as lang, vgLiteLang } from "../../../../../utils/lang"
import { SecondaryButton } from "../../../../component/Button"
import { EditableTextField } from "../../../../component/EditableTextField"
import { useEditMode } from "../../../../context/EditModeContext/Hooks"
import { CapacityGauge } from "../../../shared/CapacityGauge"
import { InventoryItemsTable } from "../../../shared/InventoryItemsTable"
import { EquipmentSheetSubtypeBody, ItemSheetProperty } from "../EquipmentSheetComponent"

export const ContainerSheet = ({ item }: { item: Item & { system: ContainerDataModel } }) => {
    const { isEditMode } = useEditMode()
    const owner = item?.actor?.system as ActorDataModel<BaseActorSchema> | null
    const contents = sortedItems<EquipmentDataModel<EquipmentSchema>>(itemsInContainer(item.system).map(it => it?.system))
    return (
        <EquipmentSheetSubtypeBody>
            <div className="mb-4">
                <div className="flex gap-x-2 mb-2">
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
                        bulk: item.system.capacity - item.system.emptySlots,
                        capacity: item.system.capacity,
                        isOverEncumbered: false
                    }} />
                </div>
                {
                    contents.length === 0 ?
                        <p className="italic">{vgLiteLang.ItemSheet.drag}</p> :
                        <div className="space-y-2">
                            <InventoryItemsTable
                                actor={owner}
                                items={contents}
                                contextMenuItems={(targetItem) => containerItemContextMenuItems(owner, targetItem, item.system)}
                                showEquipColumn={false}
                            />
                            <div className="w-full mb-12">
                                <div className="float-right">
                                    <SecondaryButton onClick={() => item.update({ 'system.itemIds': [] } as Record<string, string[]>)}>
                                        <div className="flex gap-x-2 items-center">{<Undo />}{"Extract all"}</div>
                                    </SecondaryButton>
                                </div>
                            </div>
                        </div>
                }
            </div>
        </EquipmentSheetSubtypeBody>
    )
}