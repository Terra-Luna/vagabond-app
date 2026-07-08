import { Coins } from "lucide-react"
import { HeroDataModel } from "../../../../../model/actor/HeroDataModel"
import { EditableTextField } from "../../../../component/EditableTextField"
import { EquipmentDataModel, EquipmentSchema } from "../../../../../model/item/equip/EquipmentDataModel"
import { glowOnHover } from "../../../../common/text-styles"
import { CapacityGauge } from "../../../shared/CapacityGauge"
import { InventoryItemsTable } from "../../../shared/InventoryItemsTable"
import { lang } from "../../../../../utils/lang"
import { sortedItems, isInContainer } from "../../../../../model/actor/type/Inventory"
import { getEncumbranceInfo, getContainers, equipmentContextMenuItems } from "../../../../../utils/heroInventoryUtil"

export const InventoryTab = ({ hero }: { hero: HeroDataModel }) => {
    return (
        <div className="w-full">
            <div className="flex justify-between gap-1">
                <CapacityGauge label={lang.VGLITE.HeroSheet.encumbrance} capacityInfo={getEncumbranceInfo(hero)} />
                <CoinPurse hero={hero} />
            </div>
            <div className="border border-solid border-table-border mt-1 mb-8 w-full">
                <InventoryItemsTable
                    actor={hero}
                    items={
                        sortedItems<EquipmentDataModel<EquipmentSchema>>(
                            hero.inventory.items as EquipmentDataModel<EquipmentSchema>[]
                        ).filter(it => !isInContainer(it, getContainers(hero)))
                    }
                    contextMenuItems={(item) => equipmentContextMenuItems(hero, item)} />
            </div>
        </div>
    )
}

const CoinPurse = ({ hero }: { hero: HeroDataModel }) => {
    return (
        <div className={"flex pl-2 content-center bg-wealth-fill/50 border border-solid border-table-border w-full py-1"}>
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
                    boundValue={value.toString() ?? ""}
                    updateProps={{
                        object: hero.parent,
                        path: ['inventory', 'coins', path]
                    }}
                    placeholder="0"
                    hideBorderOnEditMode={true}
                />
            </div>
            <div className={"text-wealth-denom-label text-sm content-end"}>{label}</div>
        </div>
    )
}