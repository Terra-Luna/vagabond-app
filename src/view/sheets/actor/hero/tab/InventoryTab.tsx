import { HeroDataModel } from "../../../../../model/actor/HeroDataModel"
import { EquipmentDataModel, EquipmentSchema } from "../../../../../model/item/equip/EquipmentDataModel"
import { getEncumbranceInfo, getContainers, equipmentContextMenuItems } from "../../../../../utils/heroInventoryUtil"
import { CapacityGauge } from "../../../shared/CapacityGauge"
import { InventoryItemsTable } from "../../../shared/InventoryItemsTable"
import { lang } from "../../../../../utils/lang"
import { sortedItems, isInContainer } from "../../../../../model/actor/type/Inventory"
import { HeroCoinPurse } from "../../../../component/CoinPurse"
import { PrimaryButton } from "../../../../component/Button"
import { useItemShop } from "../../../../../apps/shop/ItemShop"
import { useCallback, useEffect, useState } from "react"
import { CLOSE_GLOBAL_POPOUT_HOOK, useGlobalPopout } from "../../../../../apps/PopoutApplication"

export const InventoryTab = ({ hero }: { hero: HeroDataModel }) => {
    const { ItemShop, wallet, cart, reset } = useItemShop(hero.inventory.coins)
    const [itemShopIsOpen, setItemShopIsOpen] = useState<boolean>(false)

    const closeItemShop = useCallback(() => {
        reset()
        setItemShopIsOpen(false)
        setTimeout(() => Hooks.call(CLOSE_GLOBAL_POPOUT_HOOK, itemShopApp.popoutId), 0)
    }, [])

    const itemShopApp = useGlobalPopout(closeItemShop)

    const onShopCheckout = useCallback(async () => {
        await hero.parent.update({ 'system.inventory.coins': wallet })
        await hero.parent.createEmbeddedDocuments("Item", cart)
        closeItemShop()
    }, [cart, wallet])

    const onShopCancel = useCallback(() => {
        closeItemShop()
    }, [])

    useEffect(() => {
        if (itemShopIsOpen) {
            itemShopApp.renderPopout(
                <ItemShop
                    useCheckout={true}
                    onCheckout={() => onShopCheckout()}
                    onCancel={() => onShopCancel()}
                />, "Item Shop"
            )
        }
    }, [itemShopIsOpen, ItemShop])

    return (
        <div className="w-full">
            <div className="flex justify-between gap-1">
                <CapacityGauge label={lang.VGLITE.HeroSheet.encumbrance} capacityInfo={getEncumbranceInfo(hero)} />
                <HeroCoinPurse hero={hero} />
            </div>
            <div className="border border-solid border-table-border mt-1 w-full">
                <InventoryItemsTable
                    actor={hero}
                    items={
                        sortedItems<EquipmentDataModel<EquipmentSchema>>(
                            hero.inventory.items as EquipmentDataModel<EquipmentSchema>[]
                        ).filter(it => !isInContainer(it, getContainers(hero)))
                    }
                    contextMenuItems={(item) => equipmentContextMenuItems(hero, item)} />
            </div>
            <div className="flex w-fll justify-end mt-1 mb-8">
                <PrimaryButton onClick={() => setItemShopIsOpen(true)}>
                    Item Shop
                </PrimaryButton>
            </div>
        </div>
    )
}