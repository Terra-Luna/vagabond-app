import { Diamond, Hand, HandFist, Shield } from "lucide-react"

import { ActorDataModel, BaseActorSchema } from "../../../model/actor/ActorDataModel"
import { HeroDataModel } from "../../../model/actor/HeroDataModel"
import { itemNameQty,openItemSheet } from "../../../model/actor/type/Inventory"
import { coinsAsString } from "../../../model/common/CoinValue"
import { ArmorDataModel } from "../../../model/item/equip/ArmorDataModel"
import { EquipmentDataModel, EquipmentSchema, setEquipState } from "../../../model/item/equip/EquipmentDataModel"
import { SundryDataModel } from "../../../model/item/equip/SundryDataModel"
import { WeaponDataModel } from "../../../model/item/equip/WeaponDataModel"
import { equipArmor, equipWeapon,inventoryItemDragDropHandler } from "../../../utils/heroInventoryUtil"
import { appLang } from "../../../utils/lang"
import { getId, getName } from "../../../utils/modelUtil"
import { tableBorder, tableBorderRounded } from "../../common/border-styles"
import { CtxMenuItem, useContextMenu } from "../../component/ContextMenu"
import { useDragDrop } from "../../component/DragDrop"
import { Tooltip } from "../../component/Tooltip"

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
            <table className={`table-fixed w-full ${tableBorder}`}>
                <thead className="bg-section-header-fill text-text-section-header text-sm">
                    <tr>
                        <th className="text-left pl-2 w-5/9">{appLang.HeroSheet.Inventory.item}</th>
                        <th className="text-center">{appLang.HeroSheet.Inventory.slots}</th>
                        <th className="text-center">{appLang.HeroSheet.Inventory.value}</th>
                        {showEquipColumn &&
                            <th className="text-center">
                                {appLang.HeroSheet.Inventory.equip}
                            </th>
                        }
                    </tr>
                </thead>
                <tbody className="font-eskapade">{
                    items.map((item: EquipmentDataModel<EquipmentSchema>, index: number) => {
                        const isEquipped = item.isEquipped
                        const isBound = item.isBoundRelic()
                        const isCursed = item.isCursed()
                        const tooltip = `${isBound && !isEquipped && !isCursed
                            ? `This item must be Bound to be equipped.\nRequires a 10 minute Ritual.\nLimit: ${(actor as any).boundItemsLimit ?? 3} Bound items`
                            : `${isBound && isEquipped ? "This item is Bound to you." : ""}`}`

                        return (
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
                                {/* ITEM NAME & ICON */}
                                <td>
                                    <div className="flex gap-x-0.5 items-center py-1 min-w-0">
                                        <ItemIconImg item={item} tooltip={tooltip} />
                                        <p className="items-center truncate">{itemNameQty(item)}</p>
                                    </div>
                                </td>
                                {/* BULK SLOTS */}
                                <td className="text-center font-normal">{item.bulk.totalSlots}</td>
                                {/* VALUE */}
                                <td className="text-center font-normal truncate">
                                    {coinsAsString(item.totalValue)}
                                </td>
                                {/* EQUIP STATUS */}
                                {showEquipColumn && (
                                    item.isEquippable
                                        ? <td className="items-center">
                                            <EquipStateIcon
                                                tooltip={tooltip}
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
                        )
                    })
                }</tbody>
            </table>
            <ContextMenu />
        </div>
    )
}

const ItemIconImg = ({ item, tooltip }) => {
    const isEquipped = item.isEquipped
    const isBound = item.isBoundRelic()
    const isCursed = item.isCursed()

    return (
        <Tooltip title={appLang.HeroSheet.controls} content={tooltip}>
            <div className="flex items-center justify-center relative mr-2 shrink-0">
                <img
                    src={item.parent.img}
                    alt={getName(item)}
                    width="28"
                    height="28"
                    className="rounded-sm border border-solid border-section-header-fill/60 cursor-grab"
                />

                {/* DO NOT SHOW DIAMOND IF CURSED AND UNEQUIPPED */}
                <span>
                    {isEquipped && isBound &&
                        <Diamond
                            size={12}
                            className={`absolute bottom-0 right-0 text-text-header-tertiary fill-text-header-tertiary bg-sheet-main-fill ${tableBorderRounded}`}
                        />
                    }
                    {!isEquipped && isBound && !isCursed &&
                        <Diamond
                            size={12}
                            className={`absolute bottom-0 right-0 text-text-header-tertiary bg-sheet-main-fill ${tableBorderRounded}`}
                            strokeWidth={1}
                        />
                    }
                </span>
            </div>
        </Tooltip>
    )
}

const EquipStateIcon = ({ tooltip, type, isEquipped, gripState, toggleEquipState }: { tooltip: string, type: string, isEquipped: boolean, gripState: string, toggleEquipState: () => void }) => {
    const equippedIconStyle = "w-full justify-center text-ic-equipped fill-ic-equipped/80"
    const unEquipedIconStyle = "w-full justify-center text-ic-equipped"
    return (
        <Tooltip content={`Toggle equip\n${tooltip}`}>
            <div onClick={toggleEquipState} onDoubleClick={(e) => { e.stopPropagation() }}>
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
                                <p>{appLang.GripsAbbr[gripState]}</p>
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
        </Tooltip>
    )
}

async function toggleEquipState(hero: HeroDataModel, item: EquipmentDataModel<EquipmentSchema>) {
    if (item.isEquipped) {
        await setEquipState(hero, item, false)
    }
    else {
        if (item) {
            if (item instanceof ArmorDataModel) {
                await equipArmor(hero, item)
            }
            else if (item instanceof WeaponDataModel || item instanceof SundryDataModel) {
                await equipWeapon(hero, item)
            }
        }
        else {
            ui.notifications?.warn("Item not found!")
        }
    }
}