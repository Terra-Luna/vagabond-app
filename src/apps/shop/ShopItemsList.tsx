import { useLayoutEffect, useRef } from "react"

import { openItemSheet } from "../../model/actor/type/Inventory"
import { coinsAsString } from "../../model/common/CoinValue"
import { ArmorDataModel } from "../../model/item/equip/ArmorDataModel"
import { EquipmentDataModel, EquipmentSchema, getTotalSlots } from "../../model/item/equip/EquipmentDataModel"
import { WeaponDataModel } from "../../model/item/equip/WeaponDataModel"
import { appLang } from "../../utils/lang"
import { UtilityButton } from "../../view/component/Button"
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
                        <div className="items-center content-center px-2 py-1">
                            <div className="flex justify-between">
                                <div className="-space-y-1">
                                    <div className="flex gap-x-1">
                                        <div className="flex gap-x-1">
                                    <p className="font-bold hover-glow cursor-pointer" onClick={() => openItemSheet(item)}>{item.name}</p>
                                            {((item.type as string) === 'weapon' || item.system instanceof WeaponDataModel) && (item.system as any)?.damage &&
                                                <p className="text-text-secondary italic">{`
                                                ${(item.system as any).skills?.map(s => appLang.WeaponSkills[s]?.name).filter(Boolean).join(", ") ?? ''} 
                                                | d${(item.system as any).damage?.dice?.faces ?? 6} 
                                                | ${appLang.Grips[(item.system as any).grip?.style]?.name ?? (item.system as any).grip?.style ?? ''}
                                                | ${(item.system as any).properties?.map(p => appLang.WeaponProps[p]?.name).filter(Boolean).join(", ") ?? ''}
                                            `}</p>
                                            }
                                        </div>
                                        {((item.type as string) === 'armor' || item.system instanceof ArmorDataModel) &&
                                            <p className="text-text-secondary">{`
                                                Rating: ${(item.system as any)?.rating ?? 0}
                                                | MIT: ${(item.system as any)?.mightReq ?? 0}
                                            `}</p>
                                        }
                                    </div>
                                    <div className="flex gap-x-2">
                                        <p className="text-text-secondary">{`${appLang.EquipmentCategories[item.system?.category] ?? item.system?.category ?? ''}`}</p>
                                        <p className="text-text-secondary">•</p>
                                        <p className="text-text-secondary">{`Slots: ${getTotalSlots(item)}`}</p>
                                    </div>
                                </div>
                                <div className="flex gap-x-4 items-center">
                                    <p>{coinsAsString(item.system?.totalValue ?? item.system?.value)}</p>
                                    <UtilityButton onClick={() => onAddItemToCart(item)}>{appLang.ButtonActions.add}</UtilityButton>
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