import { useCallback, useMemo, useState } from "react"
import { addCoins, Coins, coinsAsString, isAffordable, subtractCoins } from "../../model/common/CoinValue"
import { ItemsCache } from "../../rules/util/ItemsCache"
import { EquipmentDataModel, EquipmentSchema } from "../../model/item/equip/EquipmentDataModel"
import { Divider, Header } from "../../view/component/Header"
import { openItemSheet } from "../../model/actor/type/Inventory"
import { CoinPurseReadOnly } from "../../view/component/CoinPurse"
import { EquipmentSheetComponent } from "../../view/sheets/item/equip/EquipmentSheetComponent"
import { HeroCreationDropdown } from "../hero-creator/component/HeroCreationDropdown"
import { ShoppingCart } from "./ShoppingCart"
import { StarterPackDataModel } from "../../model/item/equip/StarterPackDataModel"
import { ClassDataModel } from "../../model/item/character/ClassDataModel"
import { CategoryButtons } from "./CategoryButtons"
import { ShopItemsList } from "./ShopItemsList"

export const useItemShop = (startingFunds: Coins, clazz?: Item & { system: ClassDataModel }) => {

    const [wallet, setWallet] = useState<Coins>(startingFunds)
    const [selectedPack, setSelectedPack] = useState<Item & { system: StarterPackDataModel } | undefined>(undefined)
    const [cart, setCart] = useState<(Item & { system: EquipmentDataModel<EquipmentSchema> })[]>([])
    const [shopCategory, setShopCategory] = useState<string>('all')

    const packs = ItemsCache.packs()
    const equipmentCache = ItemsCache.equipment()
    const stock = equipmentCache.filter(it => !(it.system instanceof StarterPackDataModel)) as (Item & { system: EquipmentDataModel<EquipmentSchema> })[]

    const recommendedPacks = useMemo(() => {
        return clazz?.system.startingPacks.map(p => packs.find(s => s.id === p))
    }, [clazz])

    const otherPacks = useMemo(() => {
        return packs.filter(p => !clazz?.system.startingPacks.includes(p.id!))
    }, [clazz])

    const onSelectPack = useCallback((packId) => {
        const pack = packs.find(it => it.id === packId)
        const refund = addCoins([wallet, selectedPack?.system.cost ?? { g: 0, s: 0, c: 0 }])

        if (!pack) {
            if (selectedPack) {
                setWallet(refund)
            }
            setSelectedPack(pack)
        }
        else if (isAffordable(refund, pack.system.cost)) {
            setWallet(subtractCoins(refund, pack.system.cost))
            setSelectedPack(pack)
        }
        else {
            ui.notifications?.warn("Not enough funds!")
        }
    }, [selectedPack])

    const onAddItemToCart = useCallback((item) => {
        if (isAffordable(wallet, item.system.totalValue)) {
            setCart([...cart, item])
            const deduction = subtractCoins(wallet, item.system.totalValue)
            setWallet(deduction)
        }
        else {
            ui.notifications?.warn("Not enough funds!")
        }
    }, [cart, wallet])

    const onRemoveFromCart = useCallback((item, index) => {
        const refund = addCoins([wallet, item.system.totalValue])
        setWallet(refund)
        setCart(cart.filter((_, idx) => idx !== index))
    }, [cart, wallet])

    const filteredItems = (): (Item & { system: EquipmentDataModel<EquipmentSchema> })[] => {
        if (shopCategory === 'all') return stock
        if (shopCategory === 'gear') return stock.filter(it => ['tool', 'sundry', 'container'].includes(it.type))
        return stock.filter(it => (it.type as string) === shopCategory)
    }

    const ItemShop = ({ includeStarterPacks = false }) => {
        return (
            <div className="space-y-2">
                <div className="flex gap-x-4 items-end">
                    {/* STARTER PACK SELECTION */}
                    {includeStarterPacks &&
                        <div className="space-y-2">
                            <HeroCreationDropdown
                                label={"SELECT PACK"}
                                value={selectedPack?.id ?? ''}
                                options={[
                                    { value: '', label: "-" },
                                    ...recommendedPacks?.map(p => ({ value: p?.id, label: `${p?.name} [${coinsAsString(p?.system.cost)}] (Recommended)` })) ?? [],
                                    ...otherPacks?.map(p => ({ value: p.id, label: `${p.name} [${coinsAsString(p?.system.cost)}]` })) ?? []
                                ]}
                                onChange={(packId) => onSelectPack(packId)}
                            />
                        </div>
                    }
                    {/* WALLET */}
                    <div className="w-full mr-1">
                        <CoinPurseReadOnly coins={wallet} />
                    </div>
                </div>

                <div className="border border-solid border-table-border">
                    {selectedPack && <EquipmentSheetComponent item={selectedPack as any} hideBottomSection={true} />}
                </div>

                {/* SHOPPING CART */}
                <div>
                    <Header title={"CART"} />
                    <ShoppingCart>
                        {
                            cart.map((item, index) => (
                                <tr key={index} className="text-center even:bg-table-row-even/50 odd:bg-table-row-odd/50">
                                    <td className="text-left pl-2 hover-glow cursor-pointer" onClick={() => openItemSheet(item)}>{item.name}</td>
                                    <td>{item.system.bulk.totalSlots}</td>
                                    <td>{coinsAsString(item.system.totalValue)}</td>
                                    <td className="text-sm cursor-pointer ml-auto" onClick={() => onRemoveFromCart(item, index)}>{"❌"}</td>
                                </tr>
                            ))
                        }
                    </ShoppingCart>
                </div>

                {/* ITEM SHOP */}
                <div className="space-y-1 overflow-hidden">
                    <Header title={"ITEM SHOP"} />

                    <div className="space-y-1">
                        {/* SEARCH BY NAME */}

                        {/* CATEGORY BUTTONS */}
                        <CategoryButtons shopCategory={shopCategory} setShopCategory={setShopCategory} />
                        <Divider />

                        {/* ITEMS LIST W/ ADD BUTTON - CLICK NAME TO OPEN ITEM SHEET */}
                        <ShopItemsList items={filteredItems()} onAddItemToCart={onAddItemToCart} />

                    </div>
                </div>
            </div>
        )
    }

    return { ItemShop, wallet, cart, selectedPack }
}