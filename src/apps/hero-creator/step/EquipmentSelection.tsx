import { ReactNode, useCallback, useMemo, useState } from "react"
import { ClassDataModel } from "../../../model/item/character/ClassDataModel"
import { vgLiteLang } from "../../../utils/lang"
import { Divider, Header, ItemDivider } from "../../../view/component/Header"
import { TopNavButtons } from "../component/TopNavButtons"
import { addCoins, Coins, coinsAsString, isAffordable, subtractCoins } from "../../../model/common/CoinValue"
import { ItemsCache } from "../../../rules/util/ItemsCache"
import { StarterPackDataModel } from "../../../model/item/equip/StarterPackDataModel"
import { HeroCreationDropdown } from "../component/HeroCreationDropdown"
import { EquipmentSheetComponent } from "../../../view/sheets/item/equip/EquipmentSheetComponent"
import { EditModeOptions } from "../../../view/context/EditModeContext/EditModeOptions"
import { EditModeContextProvider } from "../../../view/context/EditModeContext/EditModeContext"
import { CoinPurseReadOnly } from "../../../view/component/CoinPurse"
import { EquipmentDataModel, EquipmentSchema } from "../../../model/item/equip/EquipmentDataModel"
import { ShoppingCart } from "../../shop/ShoppingCart"
import { createDropdownEntries } from "../../../utils/localeUtils"
import { PrimaryButton, SecondaryButton } from "../../../view/component/Button"
import { openItemSheet } from "../../../model/actor/type/Inventory"

export const useEquipmentSelection = (
    clazz: Item & { system: ClassDataModel } | undefined,
    navButtons: ReactNode[]
) => {
    const strings = vgLiteLang.HeroCreation
    const startingCoins: Coins = { g: 3, s: 0, c: 0 }
    const [wallet, setWallet] = useState<Coins>(startingCoins)
    const [selectedPack, setSelectedPack] = useState<Item & { system: StarterPackDataModel } | undefined>(undefined)
    const [cart, setCart] = useState<(Item<"base"> & { system: EquipmentDataModel<EquipmentSchema> })[]>([])
    const [shopCategory, setShopCategory] = useState<string>('all')
    const shopCategories = createDropdownEntries(vgLiteLang.ItemShop.Categories)

    const packs = ItemsCache.packs()
    const equipmentCache = ItemsCache.equipment()
    const stock = equipmentCache.filter(it => !(it.system instanceof StarterPackDataModel))

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

    const filteredItems = () => {
        if (shopCategory === 'all') return stock
        if (shopCategory === 'gear') return stock.filter(it => ['tool', 'sundry', 'container'].includes(it.type))
        return stock.filter(it => (it.type as string) === shopCategory)
    }

    const EquipmentSelection = () => {
        return (
            <EditModeContextProvider initialEditMode={EditModeOptions.NEVER}>
                <div className="bg-sheet-main-fill space-y-4">
                    <Header title={strings.equipHeader} />
                    <TopNavButtons navButtons={navButtons} subtitle={strings.equipSubheader} />

                    {/* WALLET */}
                    <div>
                        <CoinPurseReadOnly coins={wallet} />
                    </div>

                    {/* STARTER PACK SELECTION */}
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
                        <div className="border border-solid border-table-border">
                            {selectedPack && <EquipmentSheetComponent item={selectedPack as any} hideBottomSection={true} />}
                        </div>
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
                            <div className="flex gap-x-1 justify-center">
                                {
                                    shopCategories.map((cat, index) => (<>
                                        {
                                            cat.value === shopCategory ?
                                                <PrimaryButton key={index} onClick={() => { }}>{cat.label}</PrimaryButton> :
                                                <SecondaryButton key={index} onClick={() => setShopCategory(cat.value)}>{cat.label}</SecondaryButton>
                                        }
                                    </>))
                                }
                            </div>

                            <Divider />

                            {/* ITEMS LIST W/ ADD BUTTON - CLICK NAME TO OPEN ITEM SHEET */}
                            <div className="overflow-y-auto">
                                {
                                    filteredItems().map((item, index) => (
                                        <div key={index}>
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
                        </div>
                    </div>

                </div>
            </EditModeContextProvider >
        )
    }

    return { EquipmentSelection, selectedPack, wallet }
}