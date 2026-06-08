import { Coins } from "lucide-react"
import lang from "../../../../../../public/lang/en.json"
import HeroDataModel from "../../../../../model/actor/HeroDataModel"
import { coinsAsString } from "../../../../../model/common/CoinValue"
import { EditableTextField } from "../../../../component/EditableTextField"
import { equipArmor } from "../../../../../model/item/equip/ArmorDataModel"
import { equipWeapon } from "../../../../../model/item/equip/WeaponDataModel"
import { deleteItems, itemNameQty, openItemSheet, sortedItems } from "../../../../../model/actor/type/Inventory"
import { getId, getName, itemSortHandler } from "../../../../../utils/modelUtil"
import { useState } from "react"

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
    const capacity = hero.inventory.capacity || 10
    const bulk = capacity - (hero.inventory.emptySlots ?? capacity)
    const isFull = bulk/capacity >= 1
    return (
        <div className={infoBoxLayout +" px-2 "+ infoBoxText}>
            {lang.VGLITE.HeroSheet.encumbrance}
            <span className="text-md float-right">
                {bulk} / {hero.inventory.capacity}
            </span>
            <div className="h-[12px] my-1 -mx-1 border border-solid border-table-border rounded-md">
                <Gauge bulk={bulk} capacity={capacity} isFull={isFull} />
            </div>
        </div>
    )
}

const Gauge = ({ bulk, capacity, isFull }: { bulk: number, capacity: number, isFull: boolean }) => {
    const width = Math.min(bulk / capacity * 100, 100)
    const fillColor = isFull ? "bg-destructive-action " : "bg-section-header-fill"
    return (
        <div
            className={fillColor + " h-[10px] rounded-md"}
            style={{
                width: `${width}%`, transition: "width 0.8s ease-in-out"
            }} />
    )
}

const CoinPurse = ({ hero }: { hero: HeroDataModel }) => {
    const g = { value: hero.inventory.coins.g || 0, label: lang.VGLITE.HeroSheet.gold }
    const s = { value: hero.inventory.coins.s || 0, label: lang.VGLITE.HeroSheet.silver }
    const c = { value: hero.inventory.coins.c || 0, label: lang.VGLITE.HeroSheet.copper }
    return (
        <div className={"flex pl-2 " + infoBoxLayout}>
            <div 
                className="cursor-pointer content-center"
                onClick={() =>
                    ui.notifications?.info("TODO: make an interface for adding/subtracting coin amts...")
                }>
                    <Coins className="text-wealth-denom-label" size={28} />
            </div>
            <div className="flex content-center justify-end w-full">
                <CoinValue hero={hero} value={g.value} label={g.label} path='g' />
                <CoinValue hero={hero} value={s.value} label={s.label} path='s' />
                <CoinValue hero={hero} value={c.value} label={c.label} path='c' />
            </div>
        </div>
    )
}

const CoinValue = ({ hero, value, label: denomination, path }: { hero: HeroDataModel, value: number, label: string, path: string }) => {
    return (
        <div className="flex pr-2">
            <div className="text-text-primary text-3xl font-eskapade font cursor-pointer min-w-[2ch] text-right">
                <EditableTextField
                    initialValue={value.toString() ?? ""}
                    updateProps={{
                        actor: hero.parent,
                        propertyPath: ['inventory', 'coins', path]
                    }}
                />
            </div>
            <div className={"text-wealth-denom-label text-sm content-end"}>{denomination}</div>
        </div>
    )
}

const InventoryItems = ({ hero }: { hero: HeroDataModel }) => {
    const items = sortedItems(hero.inventory.items)
    const [dragIndex, setDragIndex] = useState<number | null>(null)
    const [dragItem, setDragItem] = useState<any>(null)
    const [targetItem, setTargetItem] = useState<any>(null)

    const onDragStart = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
        e.stopPropagation()
        e.dataTransfer.dropEffect = "move"
        console.log("Dragging:", getName(items[index]))
        setDragIndex(index)
        setDragItem(items[index])
    }

    const onDragEnter = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
        if (dragIndex === null || dragIndex === index) return
        e.preventDefault()
        e.stopPropagation()
        e.dataTransfer.dropEffect = "move"
        setDragIndex(index)
        setTargetItem(items[index])
        console.log("Dragging:", getName(dragItem), "over:", getName(targetItem))
    }

    const onDragEnd = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
        if (dragIndex === null || dragIndex === index) return
        e.preventDefault()
        e.stopPropagation()
        console.log("Dropping:", getName(dragItem), "onto:", getName(targetItem ?? items[items.length - 1]))

        try {
            itemSortHandler(hero, dragItem, targetItem, items)
        }
        catch (error) {
            console.log(error)
        }
        finally {
            setDragIndex(null)
            setDragItem(null)
        }
    }

    return (
        <table className="table-auto w-full">
            <thead className="bg-section-header-fill text-text-section-header text-sm">
                <tr>
                    <th className="text-left pl-1">{lang.VGLITE.HeroSheet.Inventory.item}</th>
                    <th className="text-center">{lang.VGLITE.HeroSheet.Inventory.slots}</th>
                    <th className="text-center">{lang.VGLITE.HeroSheet.Inventory.value}</th>
                    <th className="text-center">{lang.VGLITE.HeroSheet.Inventory.equip}</th>
                </tr>
            </thead>
            <tbody className="text-regular">{
                items.map((i: any, index: number) => (
                    <tr
                        key={getId(i)}
                        className={index === dragIndex ? "bg-text-fatigue-current" : "even:bg-table-row-even/50 odd:bg-table-row-odd/50"}
                        draggable
                        onDragStart={(e) => onDragStart(e, index)}
                        onDragEnter={(e) => onDragEnter(e, index)}
                        onDragOver={(e) => e.preventDefault()}
                        onDragEnd={(e) => onDragEnd(e, index)}
                    >
                        <td
                            className="px-2 py-1"
                            onClick={() => onItemClicked(hero, getId(i), true)}
                            onAuxClick={() => onItemClicked(hero, getId(i), false)}
                        >
                            {itemNameQty(i)}
                        </td>
                        <td className="text-center">{i.slots}</td>
                        <td className="text-center">{coinsAsString(i.value)}</td>
                        {
                            i.isEquippable ?
                                <td className="text-center">
                                    <input
                                        className="cursor-pointer"
                                        type="checkbox"
                                        checked={i.isEquipped} onChange={
                                            () => toggleEquipState(hero, getId(i))
                                        }
                                    />
                                </td> : <td className="text-center" />
                        }
                    </tr>
                ))
            }</tbody>
        </table>
    )
}

const onItemClicked = (hero: HeroDataModel, itemId: string, isAuxClick: boolean) => {
    isAuxClick ? openItemSheet(hero, itemId) : deleteItems(hero, [itemId])
}

const toggleEquipState = async (hero: HeroDataModel, itemId: string) => {
    const item = hero.parent.items.get(itemId)
    if (item.system.isEquipped) {
        await item.update({ 'system.isEquipped': false })
    }
    else {
        if (item) {
            if (item.type === 'armor') {
                await equipArmor(hero, item.system)
            }
            else if (item.type === 'weapon') {
                await equipWeapon(hero, item.system)
            }
            else {
                await item.update({ 'system.isEquipped': true })
            }
        }
        else {
            ui.notifications?.warn("Item not found!")
        }
    }
}