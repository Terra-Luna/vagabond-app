import { useLayoutEffect, useRef } from "react"
import { openItemSheet } from "../../model/actor/type/Inventory"
import { coinsAsString } from "../../model/common/CoinValue"
import { EquipmentDataModel, EquipmentSchema } from "../../model/item/equip/EquipmentDataModel"
import { vgLiteLang } from "../../utils/lang"
import { SecondaryButton } from "../../view/component/Button"
import { ItemDivider } from "../../view/component/Header"

let savedScrollTop = 0

export const ShopItemsList = ({ items, onAddItemToCart }: {
    items: (Item & { system: EquipmentDataModel<EquipmentSchema> })[],
    onAddItemToCart: (item) => void
}) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    /**
     * Because of how this is launched from the Hero sheet, it
     * causes re-renders to happen when clicking buttons which
     * loses the scroll state. This effect restores it.
     */
    useLayoutEffect(() => {
        const container = scrollContainerRef.current
        if (!container) return
        container.scrollTop = savedScrollTop
        return () => {
            savedScrollTop = container.scrollTop
        }
    })

    return (
        <div ref={scrollContainerRef} className="h-full overflow-auto">
            {
                items.map(item => (
                    <div key={item.uuid}>
                        <div className="items-center content-center p-2">
                            <div className="flex justify-between">
                                <div className="-space-y-1">
                                    <p className="font-bold hover-glow cursor-pointer" onClick={() => openItemSheet(item)}>{item.name}</p>
                                    <div className="flex gap-x-2">
                                        <p className="text-text-secondary">{`${vgLiteLang.EquipmentCategories[item.system.category]}`}</p>
                                        <p className="text-text-secondary">•</p>
                                        <p className="text-text-secondary">{`Slots: ${item.system.bulk.totalSlots}`}</p>
                                    </div>
                                </div>
                                <div className="flex gap-x-4 items-center">
                                    <p>{coinsAsString(item.system.totalValue)}</p>
                                    <SecondaryButton onClick={() => onAddItemToCart(item)}>Add</SecondaryButton>
                                </div>
                            </div>
                        </div>
                        <ItemDivider />
                    </div>
                ))
            }
        </div>
    )
}