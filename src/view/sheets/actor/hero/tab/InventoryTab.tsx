import { Coins } from "lucide-react"
import lang from "../../../../../../public/lang/en.json"
import HeroDataModel from "../../../../../model/actor/HeroDataModel"
import { coinsAsString } from "../../../../../model/common/CoinValue"
import { EditableTextField } from "../../../../component/EditableTextField"
import ArmorDataModel, { equipArmor } from "../../../../../model/item/equip/ArmorDataModel"
import WeaponDataModel, { equipWeapon } from "../../../../../model/item/equip/WeaponDataModel"
import { getEncumbranceInfo, itemNameQty, openItemSheet, sortedItems } from "../../../../../model/actor/type/Inventory"
import { getId, getName, itemSortHandler } from "../../../../../utils/modelUtil"
import { itemContextMenuOptions, useContextMenu } from "../../../../component/ContextMenu"
import EquipmentDataModel, { EquipmentSchema, setEquipState } from "../../../../../model/item/equip/EquipmentDataModel"
import { useDragDrop } from "../../../../component/DragDrop"
import { glowOnHover } from "../../../VgLiteSheet"

const infoBoxLayout = "content-center bg-wealth-fill/50 border border-solid border-table-border w-full py-1"
const infoBoxText = "text-section-header-fill text-sm"

export const InventoryTab = ({ hero }: { hero: HeroDataModel }) => {
    return (
        <div className="w-full">
            <div className="flex justify-between gap-1">
                <Encumbrance hero={hero} />
                <CoinPurse hero={hero} />
            </div>
            <div className="border border-solid border-table-border mt-1 w-full">
                <InventoryItems hero={hero} />
            </div>
        </div>
    )
}

const Encumbrance = ({ hero }: { hero: HeroDataModel }) => {
    const { bulk, capacity, isOverEncumbered } = getEncumbranceInfo(hero)
    return (
        <div className={infoBoxLayout +" px-2 "+ infoBoxText}>
            {lang.VGLITE.HeroSheet.encumbrance}
            <span className="text-md float-right">
                {bulk} / {hero.inventory.capacity}
            </span>
            <div className="h-[12px] my-1 -mx-1 border border-solid border-table-border rounded-md">
                <Gauge bulk={bulk} capacity={capacity} isFull={isOverEncumbered} />
            </div>
        </div>
    )
}

const Gauge = ({ bulk, capacity, isFull: isOverEncumbered }: { bulk: number, capacity: number, isFull: boolean }) => {
    const width = Math.min(bulk / capacity * 100, 100)
    const fillColor = isOverEncumbered ? "bg-destructive-action " : "bg-section-header-fill"
    return (
        <div
            className={fillColor + " h-[10px] rounded-md"}
            style={{
                width: `${width}%`, transition: "width 0.8s ease-in-out"
            }} />
    )
}

const CoinPurse = ({ hero }: { hero: HeroDataModel }) => {
    return (
        <div className={"flex pl-2 " + infoBoxLayout}>
            <div 
                className={`${glowOnHover} cursor-pointer content-center`}
                onClick={() =>
                    ui.notifications?.info("TODO: make an interface for adding/subtracting coin amts...")
                }>
                    <Coins className="text-wealth-denom-label" size={28} />
            </div>
            <div className="flex content-center justify-end w-full">
                <CoinValue hero={hero} value={hero.inventory.coins.g ?? 0} label={lang.VGLITE.HeroSheet.gold} path='g' />
                <CoinValue hero={hero} value={hero.inventory.coins.s ?? 0} label={lang.VGLITE.HeroSheet.silver} path='s' />
                <CoinValue hero={hero} value={hero.inventory.coins.c ?? 0} label={lang.VGLITE.HeroSheet.copper} path='c' />
            </div>
        </div>
    )
}

const CoinValue = ({ hero, value, label, path }: { hero: HeroDataModel, value: number, label: string, path: string }) => {
    return (
        <div className="flex pr-2">
            <div className={`text-text-primary text-3xl font-eskapade cursor-pointer min-w-[2ch] text-right ${glowOnHover}`}>
                <EditableTextField
                    initialValue={value.toString() ?? ""}
                    updateProps={{
                        actor: hero.parent,
                        propertyPath: ['inventory', 'coins', path]
                    }}
                />
            </div>
            <div className={"text-wealth-denom-label text-sm content-end"}>{label}</div>
        </div>
    )
}

const InventoryItems = ({ hero }: { hero: HeroDataModel }) => {
    const items = sortedItems(hero.inventory.items)
    const { dragIndex, dragItem, targetItem, onDragStart, onDragEnter, onDragEnd } = useDragDrop(
        items,
        () => itemSortHandler(hero, dragItem, targetItem ?? items[items.length - 1], items)
    )
    const { showMenu, setMenuVisible, hideMenu, menu } = useContextMenu()
    const handleContextMenu = (e: any, item: EquipmentDataModel<EquipmentSchema>) => {
        showMenu(e, itemContextMenuOptions(hero, item, () => setMenuVisible(false)))
    }

    return (
        <>
            <table
                className="table-auto w-full"
            >
                <thead className="bg-section-header-fill text-text-section-header text-sm">
                    <tr>
                        <th className="text-left pl-2">{/*lang.VGLITE.HeroSheet.Inventory.item*/}</th>
                        <th className="text-center">{lang.VGLITE.HeroSheet.Inventory.slots}</th>
                        <th className="text-center">{lang.VGLITE.HeroSheet.Inventory.value}</th>
                        <th className="text-center">{lang.VGLITE.HeroSheet.Inventory.equip}</th>
                    </tr>
                </thead>
                <tbody className="text-regular">{
                    items.map((i: any, index: number) => (
                        <tr
                            key={getId(i)}
                            className={
                                index === dragIndex ?
                                    "bg-text-fatigue-current" : `even:bg-table-row-even/50 odd:bg-table-row-odd/50 cursor-grab ${glowOnHover}`
                                    
                            }
                            draggable
                            onDragStart={(e) => onDragStart(e, index)}
                            onDragEnter={(e) => onDragEnter(e, index)}
                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onDragEnd={(e) => onDragEnd(e, index)}
                            onClick={hideMenu}
                            onContextMenu={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                {handleContextMenu(e, i)}
                            }}
                        >
                            <td
                                className="px-2 py-1"
                                onDoubleClick={() => onItemClicked(hero, getId(i))}
                            >
                                <span className="flex">
                                    <img src={i.parent.img} alt={getName(i)} width="24" height="24" className="mr-2 rounded-sm border border-solid border-section-header-fill/60" />
                                    {itemNameQty(i)}
                                </span>
                            </td>
                            <td className="text-center">{i.slots}</td>
                            <td className="text-center">{coinsAsString(i.value)}</td>
                            {
                                i.isEquippable ?
                                    <td className="text-center">
                                        <input
                                            className={`h-4 w-4 accent-color-section-header-fill ${glowOnHover} cursor-pointer`}
                                            type="checkbox"
                                            checked={i.isEquipped} onChange={
                                                async () => await toggleEquipState(hero, i)
                                            }
                                        />
                                    </td> : <td className="text-center" />
                            }
                        </tr>
                    ))
                }</tbody>
            </table>
            { menu }
        </>
    )
}

const onItemClicked = (hero: HeroDataModel, itemId: string) => {
    openItemSheet(hero, itemId)
}

const toggleEquipState = async (hero: HeroDataModel, item: EquipmentDataModel<EquipmentSchema>) => {
    if (item.isEquipped) {
        await setEquipState(item, false)
    }
    else {
        if (item) {
            if (item instanceof ArmorDataModel) {
                await equipArmor(hero, item)
            }
            else if (item instanceof WeaponDataModel) {
                await equipWeapon(hero, item)
            }
            else {
                await setEquipState(item, true)
            }
        }
        else {
            ui.notifications?.warn("Item not found!")
        }
    }
}