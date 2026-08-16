import { Shield, HandFist, Hand } from "lucide-react"
import { ActorDataModel, BaseActorSchema } from "../../../model/actor/ActorDataModel"
import { HeroDataModel } from "../../../model/actor/HeroDataModel"
import { openItemSheet, itemNameQty } from "../../../model/actor/type/Inventory"
import { coinsAsString } from "../../../model/common/CoinValue"
import { ArmorDataModel } from "../../../model/item/equip/ArmorDataModel"
import { EquipmentDataModel, EquipmentSchema, setEquipState } from "../../../model/item/equip/EquipmentDataModel"
import { WeaponDataModel } from "../../../model/item/equip/WeaponDataModel"
import { getId, getName } from "../../../utils/modelUtil"
import { CtxMenuItem, useContextMenu } from "../../component/ContextMenu"
import { useDragDrop } from "../../component/DragDrop"
import { vgLiteLang } from "../../../utils/lang"
import { inventoryItemDragDropHandler, equipArmor, equipWeapon } from "../../../utils/heroInventoryUtil"
import { ToolDataModel } from "../../../model/item/equip/ToolDataModel"

export const InventoryItemsTable = ({ actor, items, contextMenuItems, showEquipColumn = true }: {
    actor: ActorDataModel<BaseActorSchema> | null,
    items: EquipmentDataModel<EquipmentSchema>[],
    contextMenuItems: (item: EquipmentDataModel<EquipmentSchema>) => CtxMenuItem[],
    showEquipColumn?: boolean
}) => {
    const { onCtxMenu, ContextMenu } = useContextMenu()

    const { dragIndex, dragItem, targetItem, onDragStart, onDragEnter, onDragLeave, onDragEnd } = useDragDrop(
        items, () => inventoryItemDragDropHandler(actor, dragItem, targetItem ?? items[items.length - 1], items)
    )

    return (
        <div className="overflow-auto" onDragLeave={(e) => onDragLeave(e)}>
            <table className="table-fixed w-full border border-solid border-table-border">
                <thead className="bg-section-header-fill text-text-section-header text-sm">
                    <tr>
                        <th className="text-left pl-2 w-5/9">{vgLiteLang.HeroSheet.Inventory.item}</th>
                        <th className="text-center">{vgLiteLang.HeroSheet.Inventory.slots}</th>
                        <th className="text-center">{vgLiteLang.HeroSheet.Inventory.value}</th>
                        {showEquipColumn &&
                            <th className="text-center">
                                {vgLiteLang.HeroSheet.Inventory.equip}
                            </th>
                        }
                    </tr>
                </thead>
                <tbody className="font-eskapade">{
                    items.map((item: EquipmentDataModel<EquipmentSchema>, index: number) => (
                        <tr
                            key={getId(item)}
                            className={
                                index === dragIndex ?
                                    "bg-text-fatigue-current draggable" :
                                    `even:bg-table-row-even/50 odd:bg-table-row-odd/50 hover-glow draggable`
                            }
                            onContextMenu={(e) => { onCtxMenu(e, contextMenuItems(item)) }}
                            onDoubleClick={() => openItemSheet(item)}
                            draggable={true}
                            onDragStart={(e) => onDragStart(e, index)}
                            onDragEnter={(e) => onDragEnter(e, index)}
                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onDragEnd={(e) => onDragEnd(e, index)}
                            data-item-id={getId(item)}
                        >
                            <td className="px-2 py-1">
                                <span className="flex">
                                    <img
                                        src={item.parent.img}
                                        alt={getName(item)}
                                        width="28" height="28"
                                        className="mr-2 rounded-sm border border-solid border-section-header-fill/60 cursor-grab"
                                    />
                                    <p className="items-center line-clamp-1">{itemNameQty(item)}</p>
                                </span>
                            </td>
                            <td className="text-center font-normal">{item.bulk.totalSlots}</td>
                            <td className="text-center font-normal">{coinsAsString(item.totalValue)}</td>
                            {
                                showEquipColumn && (
                                    item.isEquippable
                                        ? <td className="items-center">
                                            <EquipStateIcon
                                                type={item.parent.type}
                                                isEquipped={item.isEquipped}
                                                gripState={(item as any).grip?.state}
                                                toggleEquipState={
                                                    async () => await toggleEquipState(actor as HeroDataModel, item)
                                                }
                                            />
                                        </td>
                                        : <td className="text-center" />
                                )
                            }
                        </tr>
                    ))
                }</tbody>
            </table>
            <ContextMenu />
        </div>
    )
}

const EquipStateIcon = ({ type, isEquipped, gripState, toggleEquipState }: { type: string, isEquipped: boolean, gripState: string, toggleEquipState: () => void }) => {
    const equippedIconStyle = "w-full justify-center text-ic-equipped fill-ic-equipped/80"
    const unEquipedIconStyle = "w-full justify-center text-ic-equipped"
    return (
        <div onClick={toggleEquipState} title="Toggle equip" onDoubleClick={(e) => { e.stopPropagation() }}>
            {
                type === 'armor' &&
                <div>
                    {isEquipped
                        ? <Shield size={18} className={equippedIconStyle} />
                        : <Shield size={18} className={unEquipedIconStyle} />
                    }
                </div>
            }
            {
                type === 'weapon'
                    ? <div>
                        {isEquipped
                            ? <div className="flex items-center justify-end -space-x-4 font-eskapade text-text-secondary">
                                <p>{vgLiteLang.GripsAbbr[gripState]}</p>
                                <HandFist size={18} className={equippedIconStyle} />
                            </div>
                            : <Hand size={18} className={unEquipedIconStyle} />
                        }
                    </div>
                    : <div>
                        {type !== 'armor' && type !== 'weapon' && <>{
                            isEquipped
                                ? <HandFist size={18} className={equippedIconStyle} />
                                : <Hand size={18} className={unEquipedIconStyle} />
                        }</>}
                    </div>
            }
        </div>
    )
}

async function toggleEquipState(hero: HeroDataModel, item: EquipmentDataModel<EquipmentSchema>) {
    if (item.isEquipped) {
        await setEquipState(item, false)
    }
    else {
        if (item) {
            if (item instanceof ArmorDataModel) {
                await equipArmor(hero, item)
            }
            else if (item instanceof WeaponDataModel || item instanceof ToolDataModel) {
                await equipWeapon(hero, item)
            }
        }
        else {
            ui.notifications?.warn("Item not found!")
        }
    }
}