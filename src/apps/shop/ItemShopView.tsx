import { useCallback, useMemo, useRef, useState } from "react"

import { openItemSheet } from "../../model/actor/type/Inventory"
import { addCoins, Coins, coinsAsString, isAffordable, multiplyCoins, subtractCoins, zeroCoins } from "../../model/common/CoinValue"
import { ClassDataModel } from "../../model/item/character/ClassDataModel"
import { EquipmentDataModel, EquipmentSchema, getTotalSlots } from "../../model/item/equip/EquipmentDataModel"
import { StartingPackDataModel } from "../../model/item/equip/StartingPackDataModel"
import { ItemsCache } from "../../rules/util/ItemsCache"
import { groupBy } from "../../utils/collectionUtil"
import { appLang } from "../../utils/lang"
import { tableBorder, tableBorderRounded } from "../../view/common/border-styles"
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

export const getPackCost = (pack: any): Coins => {
    if (!pack) return { ...zeroCoins }
    if (pack.system?.cost) return pack.system.cost
    const val = pack.system?.value ?? { g: 0, s: 0, c: 0 }
    return subtractCoins({ g: 3, s: 0, c: 0 }, val)
}

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
            !(it.system instanceof StartingPackDataModel) && (it.type as string) !== 'startingpack' && it.name.toUpperCase() !== 'BREATH ATTACK'
        ) as (Item & { system: EquipmentDataModel<EquipmentSchema> })[]
    }, [equipmentCache])

    const recommendedPacks = useMemo(() => {
        return clazz?.system.startingPacks.map(p => packs.find(s => s.uuid === p))
    }, [clazz, packs])

    const otherPacks = useMemo(() => {
        return packs.filter(p => !clazz?.system.startingPacks.includes(p.uuid!))
    }, [clazz, packs])

    const reset = useCallback(() => {
        setShopCategory('all')
        setCart([])
    }, [])

    const ItemShopView = ({ includeStartingPacks = false, useCheckout = false, onCheckout = () => { }, onCancel = () => { } }) => {
        const [shopSearch, setShopSearch] = useState(() => shopSearchRef.current)

        const onSelectPack = useCallback((packId) => {
            const pack = packs.find(it => it.uuid === packId)
            const refund = addCoins([wallet, selectedPack ? getPackCost(selectedPack) : { ...zeroCoins }])

            if (!pack) {
                if (selectedPack) {
                    setWallet(refund)
                }
                setSelectedPack(undefined)
            }
            else {
                const packCost = getPackCost(pack)
                if (isAffordable(refund, packCost)) {
                    setWallet(subtractCoins(refund, packCost))
                    setSelectedPack(pack)
                }
                else {
                    ui.notifications?.warn("Not enough funds!")
                }
            }
        }, [selectedPack, wallet, packs])

        const onAddItemToCart = useCallback((item) => {
            const itemValue = item.system?.totalValue ?? item.system?.value ?? { ...zeroCoins }
            if (isAffordable(wallet, itemValue)) {
                setCart([...cart, item])
                const deduction = subtractCoins(wallet, itemValue)
                setWallet(deduction)
            }
            else {
                ui.notifications?.warn("Not enough funds!")
            }
        }, [cart, wallet])

        const onRemoveFromCart = useCallback((item, index) => {
            const cartItem = cart.find(it => it.name === item.name)
            const itemValue = cartItem?.system?.totalValue ?? cartItem?.system?.value ?? { ...zeroCoins }
            const refund = addCoins([wallet, itemValue])
            setWallet(refund)
            setCart(cart.filter((_, idx) => idx !== index))
        }, [cart, wallet])

        const filteredItems = useMemo((): (Item & { system: EquipmentDataModel<EquipmentSchema> })[] => {
            if (shopCategory === 'all') return shopItems
            if (shopCategory === 'gear') return shopItems.filter(it => ['sundry', 'container'].includes(it.type))
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

        const cartDisplayItems = (): { name: string, qty: number, slots: number, value: Coins }[] => {
            const displayItems: { name: string, qty: number, slots: number, value: Coins }[] = []
            const groupedItems = groupBy('name', cart)

            Object.keys(groupedItems).forEach(name => {
                const group = groupedItems[name]
                const first = group[0]
                const singleItemSlots = getTotalSlots(first)
                const bulk = first?.bulk ?? first?.system?.bulk
                const totalSlotsForGroup = bulk?.isStackable
                    ? (singleItemSlots > 0 ? group.length * singleItemSlots : Math.floor(group.length / (bulk?.stackSize || 10)))
                    : group.length * singleItemSlots
                const itemVal = first.system?.totalValue ?? first.system?.value ?? { ...zeroCoins }
                displayItems.push({
                    name: name, qty: group.length,
                    slots: totalSlotsForGroup,
                    value: multiplyCoins(itemVal, group.length)
                })
            })

            return displayItems
        }

        const cartTotal = (): string => {
            const total = addCoins([...cartDisplayItems().map(it => it.value)])
            return coinsAsString(total) ?? ""
        }

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
                                                ...recommendedPacks?.map(p => ({ value: p?.uuid, label: `${p?.name} [${coinsAsString(getPackCost(p))}] (Recommended)` })) ?? [],
                                                ...otherPacks?.map(p => ({ value: p.uuid, label: `${p.name} [${coinsAsString(getPackCost(p))}]` })) ?? []
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
                                        className={`w-full text-lg text-text-secondary font-paradigm font-normal italic px-2 py-1 pr-8 ${tableBorderRounded}`}
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
                            {/* TOTAL COST W/ CHECKOUT & CANCEL BUTTONS */}
                            <div className="flex w-full gap-x-4 justify-between my-1">
                                <p className="text-xl text-text-primary font-eskapade font-bold">
                                    Total: {cartTotal()}
                                </p>

                                {useCheckout &&
                                    <div className="flex gap-x-1">
                                        <DestructiveButton onClick={onCancel}>{appLang.ButtonActions.cancel}</DestructiveButton>
                                        <PrimaryButton onClick={onCheckout}>{appLang.ButtonActions.checkout}</PrimaryButton>
                                    </div>
                                }

                            </div>
                            {/* SHOPPING CART ITEMS LIST */}
                            <ShoppingCart>
                                {cartDisplayItems().map((item, index) => (
                                    <tr key={index} className="text-center even:bg-table-row-even/50 odd:bg-table-row-odd/50">
                                        <td className="text-left pl-2 hover-glow cursor-pointer" onClick={() => openItemSheet(item)}>{item.name}</td>
                                        <td>{item.slots}</td>
                                        <td>{item.qty}</td>
                                        <td>{coinsAsString(item.value)}</td>
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

    return { ItemShopView, wallet, cart, reset, shopCategory, selectedPack }
}