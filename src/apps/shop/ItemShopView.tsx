import { useCallback, useMemo, useRef, useState } from "react"

import { openItemSheet } from "../../model/actor/type/Inventory"
import { addCoins, Coins, coinsAsString, isAffordable, subtractCoins } from "../../model/common/CoinValue"
import { ClassDataModel } from "../../model/item/character/ClassDataModel"
import { EquipmentDataModel, EquipmentSchema } from "../../model/item/equip/EquipmentDataModel"
import { StartingPackDataModel } from "../../model/item/equip/StartingPackDataModel"
import { ItemsCache } from "../../rules/util/ItemsCache"
import { vgLiteLang } from "../../utils/lang"
import { tableBorder } from "../../view/common/border-styles"
import { DestructiveButton, PrimaryButton } from "../../view/component/Button"
import { ReadOnlyCoinPurse } from "../../view/component/CoinPurse"
import { Divider, Header } from "../../view/component/Header"
import { EditModeContextProvider } from "../../view/context/EditModeContext/EditModeContext"
import { EditModeOptions } from "../../view/context/EditModeContext/EditModeOptions"
import { EquipmentSheetComponent } from "../../view/sheets/item/equip/EquipmentSheetComponent"
import { HeroCreationDropdown } from "../hero-creator/component/HeroCreationDropdown"
import { CategoryButtons } from "./CategoryButtons"
import { ShopItemsList } from "./ShopItemsList"
import { ShoppingCart } from "./ShoppingCart"

export const useItemShopView = (startingFunds: Coins, clazz?: Item & { system: ClassDataModel }) => {

    const [wallet, setWallet] = useState<Coins>(startingFunds)
    const [selectedPack, setSelectedPack] = useState<Item & { system: StartingPackDataModel } | undefined>(undefined)
    const [cart, setCart] = useState<(Item & { system: EquipmentDataModel<EquipmentSchema> })[]>([])
    const [shopCategory, setShopCategory] = useState<string>('all')
    const shopSearchRef = useRef('')

    const packs = ItemsCache.packs()
    const equipmentCache = ItemsCache.equipment()
    const shopItems = useMemo(() => {
        return equipmentCache.filter(it =>
            !(it.system instanceof StartingPackDataModel) && it.name.toUpperCase() !== 'BREATH ATTACK'
        ) as (Item & { system: EquipmentDataModel<EquipmentSchema> })[]
    }, [])

    const recommendedPacks = useMemo(() => {
        return clazz?.system.startingPacks.map(p => packs.find(s => s.uuid === p))
    }, [clazz])

    const otherPacks = useMemo(() => {
        return packs.filter(p => !clazz?.system.startingPacks.includes(p.uuid!))
    }, [clazz])

    const reset = useCallback(() => {
        setShopCategory('all')
        setCart([])
    }, [shopCategory, cart, wallet])

    const ItemShopView = ({ includeStartingPacks = false, useCheckout = false, onCheckout = () => { }, onCancel = () => { } }) => {
        const [shopSearch, setShopSearch] = useState(() => shopSearchRef.current)

        const onSelectPack = useCallback((packId) => {
            const pack = packs.find(it => it.uuid === packId)
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

        const filteredItems = useMemo((): (Item & { system: EquipmentDataModel<EquipmentSchema> })[] => {
            if (shopCategory === 'all') return shopItems
            if (shopCategory === 'gear') return shopItems.filter(it => ['tool', 'sundry', 'container'].includes(it.type))
            return shopItems.filter(it => (it.type as string) === shopCategory)
        }, [shopCategory, shopItems])

        const searchMatchItems = useMemo(() => {
            if (shopSearch.trim().length > 0) {
                return filteredItems.filter(it => it.name.toUpperCase().includes(shopSearch.toUpperCase()))
            }
            else {
                return filteredItems
            }
        }, [filteredItems, shopSearch])

        return (
            <div className="@container flex flex-col gap-y-2 h-full overflow-hidden">
                <div className="flex flex-col w-full justify-center h-full overflow-hidden">
                    <div className="inline-flex flex-col items-stretch space-y-4 @2xl:w-1/2 mx-auto h-full overflow-hidden">
                        <div className="flex gap-x-4 items-end">
                            {/* STARTING PACK SELECTION */}
                            {includeStartingPacks &&
                                <div className="space-y-2">
                                    <EditModeContextProvider initialEditMode={EditModeOptions.TRUE}>
                                        <HeroCreationDropdown
                                            label={"SELECT PACK"}
                                            value={selectedPack?.uuid ?? ''}
                                            options={[
                                                { value: '', label: "-" },
                                                ...recommendedPacks?.map(p => ({ value: p?.uuid, label: `${p?.name} [${coinsAsString(p?.system.cost)}] (Recommended)` })) ?? [],
                                                ...otherPacks?.map(p => ({ value: p.uuid, label: `${p.name} [${coinsAsString(p?.system.cost)}]` })) ?? []
                                            ]}
                                            onChange={(packId) => onSelectPack(packId)}
                                        />
                                    </EditModeContextProvider>
                                </div>
                            }
                            {/* WALLET */}
                            <div className="w-full mx-2 mt-2">
                                <ReadOnlyCoinPurse coins={wallet} />
                            </div>
                        </div>

                        <div className={`${tableBorder}`}>
                            {selectedPack && <EquipmentSheetComponent item={selectedPack as any} hideBottomSection={true} />}
                        </div>

                        {/* ITEMS LIST */}
                        <div className="flex flex-col min-h-0 h-2/3 gap-y-1">
                            <Header title={"ITEM SHOP"} />

                            <div className="flex flex-col flex-1 space-y-1 min-h-0">
                                {/* SEARCH BY NAME */}
                                <div className="relative flex items-center mx-2">
                                    <input
                                        type="text"
                                        value={shopSearch}
                                        placeholder="Search items..."
                                        className="w-full text-lg text-text-secondary font-paradigm font-normal italic p-1 pr-8"
                                        onChange={(e) => {
                                            shopSearchRef.current = e.target.value
                                            setShopSearch(e.target.value)
                                        }}
                                        autoComplete="off"
                                    />
                                    {shopSearch.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                shopSearchRef.current = ""
                                                setShopSearch("")
                                            }}
                                            className="absolute right-0 pr-2 text-text-secondary hover:text-destructive-action font-bold cursor-pointer"
                                            aria-label="Clear search"
                                        >✕</button>
                                    )}
                                </div>

                                {/* CATEGORY BUTTONS */}
                                <CategoryButtons shopCategory={shopCategory} setShopCategory={setShopCategory} />
                                <Divider />

                                {/* ITEMS LIST W/ ADD BUTTON - CLICK NAME TO OPEN ITEM SHEET */}
                                <ShopItemsList
                                    items={shopSearch.trim().length > 0 ? searchMatchItems : filteredItems}
                                    onAddItemToCart={onAddItemToCart}
                                />

                            </div>
                        </div>

                        {/* SHOPPING CART */}
                        <div className="flex flex-col min-h-0 h-1/3 px-2 mb-8">
                            <Header title={"CART"} />
                            {/* TOTAL COST W/ SAVE & CANCEL BUTTONS */}
                            <div className="flex w-full gap-x-4 justify-between my-1">
                                <p className="text-xl text-text-primary font-eskapade font-bold">
                                    Total: {(() => {
                                        const total = cart.reduce((sum, it) => {
                                            return addCoins([sum, it.system.totalValue])
                                        }, { g: 0, s: 0, c: 0 })
                                        return `${coinsAsString(total)}`
                                    })()}
                                </p>

                                {useCheckout &&
                                    <div className="flex gap-x-1">
                                        <PrimaryButton onClick={onCheckout}>{vgLiteLang.ButtonActions.checkout}</PrimaryButton>
                                        <DestructiveButton onClick={onCancel}>{vgLiteLang.ButtonActions.cancel}</DestructiveButton>
                                    </div>
                                }

                            </div>
                            {/* SHOPPING CART ITEMS LIST */}
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
                    </div>
                </div>
            </div>
        )
    }

    return { ItemShop: ItemShopView, wallet, cart, reset, shopCategory, selectedPack }
}