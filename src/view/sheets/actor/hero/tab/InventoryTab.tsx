import { HeroDataModel } from "../../../../../model/actor/HeroDataModel"
import { EquipmentDataModel, EquipmentSchema } from "../../../../../model/item/equip/EquipmentDataModel"
import { getEncumbranceInfo, getContainers, equipmentContextMenuItems } from "../../../../../utils/heroInventoryUtil"
import { CapacityGauge } from "../../../shared/CapacityGauge"
import { InventoryItemsTable } from "../../../shared/InventoryItemsTable"
import { lang } from "../../../../../utils/lang"
import { sortedItems, isInContainer } from "../../../../../model/actor/type/Inventory"
import { HeroCoinPurse } from "../../../../component/CoinPurse"
import { PrimaryButton } from "../../../../component/Button"
import { ItemShopApp } from "../../../../../apps/shop/ItemShopApp"
import { getItemShopToggle } from "../../../../../apps/vagabond-tools/usecase/VagabondSettingsHelper"

export const InventoryTab = ({ hero }: { hero: HeroDataModel }) => {
    const itemShopToggle = getItemShopToggle()

    return (
        <div className="w-full min-h-16">
            <div className="flex justify-between gap-1">
                <CapacityGauge label={lang.VGLITE.HeroSheet.encumbrance} capacityInfo={getEncumbranceInfo(hero)} />
                <HeroCoinPurse hero={hero} />
            </div>
            <div className={`border border-solid border-table-border mt-1 w-full ${itemShopToggle ? '' : 'mb-28'}`}>
                <InventoryItemsTable
                    actor={hero}
                    items={
                        sortedItems<EquipmentDataModel<EquipmentSchema>>(
                            hero.inventory.items as EquipmentDataModel<EquipmentSchema>[]
                        ).filter(it => !isInContainer(it, getContainers(hero)))
                    }
                    contextMenuItems={(item) => equipmentContextMenuItems(hero, item)} />
            </div>
            {itemShopToggle &&
                <div className="flex w-fll justify-end mt-1 mb-28">
                    <PrimaryButton onClick={() => new ItemShopApp(hero.parent).render({ force: true })}>
                        Item Shop
                    </PrimaryButton>
                </div>
            }
        </div>
    )
}