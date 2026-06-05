import { Coins } from "lucide-react"
import lang from "../../../../../../public/lang/en.json"
import HeroDataModel from "../../../../../model/actor/HeroDataModel"
import { coinsAsString } from "../../../../../model/common/CoinValue"

const inventoryTabDiv = "w-full my-1"
const infoBoxLayout = "bg-wealth-fill border border-solid border-table-border items-center w-full px-2 py-1"
const infoBoxText = "text-text-special text-sm"

export const InventoryTab = ({ hero }: { hero: HeroDataModel }) => {
    return (
        <div className={inventoryTabDiv}>
            <div className="flex justify-between gap-1">
                <Encumbrance hero={hero} />
                <Wealth hero={hero} />
            </div>
            <div className="border border-solid border-table-border mt-1 w-full">
                <InventoryItems hero={hero} />
            </div>
        </div>
    )
}

const Encumbrance = ({ hero }: { hero: HeroDataModel }) => {
    const capacity = hero.inventory.capacity || 2
    const bulk = capacity - (hero.inventory.emptySlots || 0)
    const isFull = bulk/capacity >= 1
    return (
        <div className={infoBoxLayout +" "+ infoBoxText}>
            {lang.VGLITE.HeroSheet.encumbrance}
            <span className="text-md float-right">
                {bulk} / {hero.inventory.capacity}
            </span>
            <div className="h-[12px] -mx-1 mt-2 mb-2 border border-solid border-table-border rounded-md">
                <Gague bulk={bulk} capacity={capacity} isFull={isFull} />
            </div>
        </div>
    )
}

const Wealth = ({ hero }: { hero: HeroDataModel }) => {
    const g = { v: hero.inventory.coins.g || 0, type: lang.VGLITE.HeroSheet.gold }
    const s = { v: hero.inventory.coins.s || 0, type: lang.VGLITE.HeroSheet.silver }
    const c = { v: hero.inventory.coins.c || 0, type: lang.VGLITE.HeroSheet.copper }
    return (
        <div className={infoBoxLayout +" "+ infoBoxText}>
            <div className="flex items-center justify-between">
                <CoinsIcon />
                <div className="flex float-right gap-2">
                    <CoinContainer v={g.v} type={g.type} />
                    <CoinContainer v={s.v} type={s.type} />
                    <CoinContainer v={c.v} type={c.type} />
                </div>
            </div>
        </div>
    )
}

const InventoryItems = ({ hero }: { hero: HeroDataModel }) => {
    const items = hero.inventory.items
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
                items.map(i => (
                    <tr key={i.parent._id} className="even:bg-table-row-even odd:bg-table-row-odd">
                        {
                            (i.quantity || 0) > 1 ?
                                <td className="pl-1 py-1">{i.name} (x{i.quantity})</td> :
                                <td className="pl-1 py-1">{i.name}</td>
                        }
                        <td className="text-center">{i.slots}</td>
                        <td className="text-center">{coinsAsString(i.value)}</td>
                        {
                            i.isEquippable ? <td className="text-center">{
                                i.isEquipped ? 'X' : ''
                            }</td> : <></>
                        }
                    </tr>
                ))
            }</tbody>
        </table>
    )
}

const CoinsIcon = () => {
    return (
        <div className="text-text-primary border border-solid border-text-primary rounded p-1">
            <Coins size={18} />
        </div>
    )
}
const CoinContainer = ({ v, type }: { v: number, type: string }) => {
    return (
        <div className="text-right">
            <div className="text-text-primary text-2xl font-eskapade">{v}</div>
            <div className="text-text-tertiary text-xs">{type}</div>
        </div>
    )
}

const Gague = ({ bulk, capacity, isFull }: { bulk: number, capacity: number, isFull: boolean }) => {
    const width = "w-" + bulk + "/" + capacity + " "
    const fillColor = isFull ? "bg-destructive-action " : "bg-section-header-fill "
    console.log(width, fillColor)
    return (
        <div className={width + fillColor + "h-[10px] rounded-md"} />
    )
}