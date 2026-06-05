import { Coins } from "lucide-react"
import lang from "../../../../../../public/lang/en.json"
import HeroDataModel from "../../../../../model/actor/HeroDataModel"
import { coinsAsString } from "../../../../../model/common/CoinValue"
import { EditableTextField } from "../../../../component/EditableTextField"

const inventoryTabDiv = "w-full my-1"
const infoBoxLayout = "bg-wealth-fill border border-solid border-table-border items-center w-full px-2 py-1"
const infoBoxText = "text-section-header-fill text-sm"

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
    const bulk = capacity - (hero.inventory.emptySlots || capacity)
    const isFull = bulk/capacity >= 1
    return (
        <div className={infoBoxLayout +" "+ infoBoxText}>
            {lang.VGLITE.HeroSheet.encumbrance}
            <span className="text-md float-right">
                {bulk} / {hero.inventory.capacity}
            </span>
            <div className="h-[12px] -mx-1 my-2 border border-solid border-table-border rounded-md">
                <Gague bulk={bulk} capacity={capacity} isFull={isFull} />
            </div>
        </div>
    )
}

const Wealth = ({ hero }: { hero: HeroDataModel }) => {
    const g = { value: hero.inventory.coins.g || 0, denomination: lang.VGLITE.HeroSheet.gold }
    const s = { value: hero.inventory.coins.s || 0, denomination: lang.VGLITE.HeroSheet.silver }
    const c = { value: hero.inventory.coins.c || 0, denomination: lang.VGLITE.HeroSheet.copper }
    return (
        <div className={infoBoxLayout +" "+ infoBoxText}>
            <div className="flex items-center justify-between">
                <CoinsIcon />
                <div className="flex gap-2">
                    <CoinContainer hero={hero} value={g.value} denomination={g.denomination} />
                    <CoinContainer hero={hero} value={s.value} denomination={s.denomination} />
                    <CoinContainer hero={hero} value={c.value} denomination={c.denomination} />
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
        <div className="text-section-header-fill border border-solid border-section-header-fill rounded p-1">
            <Coins size={18} />
        </div>
    )
}

//<EditableTextField 
// initialValue={hero.mana.current?.toString() ?? ""} 
// updateProps={{ actor: hero.parent, propertyPath: ['mana', 'current'] }} 
// />
const CoinContainer = ({ hero, value, denomination }: { hero: HeroDataModel, value: number, denomination: string }) => {
    return (
        <div className="text-right">
            <div className="text-text-primary text-2xl font-eskapade">
                <EditableTextField
                    initialValue={value.toString() ?? ""}
                    updateProps={{
                        actor: hero.parent,
                        propertyPath: ['inventory', 'coins', denomination.toLocaleLowerCase()[0]]
                    }}
                />
            </div>
            <div className="text-text-tertiary text-xs">{denomination}</div>
        </div>
    )
}

/**
 * This gague isn't working quite right, the width ratio isn't calculating right.
 * Might be an issue or limitation with Tailwind.
 */
const Gague = ({ bulk, capacity, isFull }: { bulk: number, capacity: number, isFull: boolean }) => {
    const width = "w-" + bulk + "/" + capacity + " "
    const fillColor = isFull ? "bg-destructive-action " : "bg-section-header-fill "
    return (
        <div className={width + fillColor + "h-[10px] rounded-md"} />
    )
}