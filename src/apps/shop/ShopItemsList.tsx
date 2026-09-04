import { useLayoutEffect, useRef } from "react"

import { openItemSheet } from "../../model/actor/type/Inventory"
import { coinsAsString } from "../../model/common/CoinValue"
import { ArmorDataModel } from "../../model/item/equip/ArmorDataModel"
import { EquipmentDataModel, EquipmentSchema } from "../../model/item/equip/EquipmentDataModel"
import { WeaponDataModel } from "../../model/item/equip/WeaponDataModel"
import { appLang } from "../../utils/lang"
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
                        <div className="items-center content-center px-2 py-0.5">
                            <div className="flex justify-between">
                                <div className="-space-y-1">
                                    <div className="flex gap-x-1">
                                        <div className="flex gap-x-1">
                                    <p className="font-bold hover-glow cursor-pointer" onClick={() => openItemSheet(item)}>{item.name}</p>
                                            {item.system instanceof WeaponDataModel &&
                                                <p className="text-text-secondary italic">{`
                                                ${item.system.skills.map(s => appLang.WeaponSkills[s]?.name).join(", ")} 
                                                | d${item.system.damage.dice.faces} 
                                                | ${appLang.Grips[item.system.grip.style]}
                                                | ${item.system.properties.map(p => appLang.WeaponProps[p].name).join(", ")}
                                            `}</p>
                                            }
                                        </div>
                                        {item.system instanceof ArmorDataModel &&
                                            <p className="text-text-secondary">{`
                                                Rating: ${item.system.rating}
                                                | MIT: ${item.system.mightReq}
                                            `}</p>
                                        }
                                    </div>
                                    <div className="flex gap-x-2">
                                        <p className="text-text-secondary">{`${appLang.EquipmentCategories[item.system.category]}`}</p>
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