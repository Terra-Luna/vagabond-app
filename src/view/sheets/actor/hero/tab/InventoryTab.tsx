import { HeroDataModel } from "../../../../../model/actor/HeroDataModel"
import { EquipmentDataModel, EquipmentSchema } from "../../../../../model/item/equip/EquipmentDataModel"
import { CapacityGauge } from "../../../shared/CapacityGauge"
import { InventoryItemsTable } from "../../../shared/InventoryItemsTable"
import { lang } from "../../../../../utils/lang"
import { sortedItems, isInContainer } from "../../../../../model/actor/type/Inventory"
import { getEncumbranceInfo, getContainers, equipmentContextMenuItems } from "../../../../../utils/heroInventoryUtil"
import { CoinPurse } from "../../../../component/CoinPurse"

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