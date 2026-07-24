import { useMemo, useState } from "react"
import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { Coins } from "../../model/common/CoinValue"
import { ItemsCache } from "../../rules/util/ItemsCache"
import { EquipmentDataModel, EquipmentSchema } from "../../model/item/equip/EquipmentDataModel"

interface CartItem {
    item: EquipmentDataModel<EquipmentSchema>
    quantity: number
}

export default function ItemShop({ actor }: { actor: Actor & { system: HeroDataModel }}) {
    const [cart, setCart] = useState<CartItem[]>([])

    const stock = useMemo<(Item & { system: EquipmentDataModel<EquipmentSchema> })[]>(() => {
        return ItemsCache.equipment()
    }, [])

    const wallet = useMemo<Coins>(() => {
        return actor?.system?.inventory?.coins ?? { g: 0, s: 0, c: 0 }
    }, [actor])

    const updateCartQuantity = (itemId: string, amount: number): void => {
        setCart((prevCart) =>
            prevCart
                .map((i) => (i.item.parent.id === itemId ? { ...i, quantity: i.quantity + amount } : i))
                .filter((i) => i.quantity > 0)
        )
    }

    return (
        <div className="">
            
        </div>
    )
}