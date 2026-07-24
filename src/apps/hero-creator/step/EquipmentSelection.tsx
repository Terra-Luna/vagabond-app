import { ReactNode, useCallback, useEffect, useMemo, useState } from "react"
import { ClassDataModel } from "../../../model/item/character/ClassDataModel"
import { vgLiteLang } from "../../../utils/lang"
import { Header } from "../../../view/component/Header"
import { TopNavButtons } from "../component/TopNavButtons"
import { addCoins, Coins, coinsAsString, isAffordable, subtractCoins } from "../../../model/common/CoinValue"
import { ItemsCache } from "../../../rules/util/ItemsCache"
import { StarterPackDataModel } from "../../../model/item/equip/StarterPackDataModel"
import { HeroCreationDropdown } from "../component/HeroCreationDropdown"
import { EquipmentSheetComponent } from "../../../view/sheets/item/equip/EquipmentSheetComponent"
import { EditModeOptions } from "../../../view/context/EditModeContext/EditModeOptions"
import { EditModeContextProvider } from "../../../view/context/EditModeContext/EditModeContext"
import { CoinPurseReadOnly } from "../../../view/component/CoinPurse"

export const useEquipmentSelection = (
    clazz: Item & { system: ClassDataModel } | undefined,
    navButtons: ReactNode[]
) => {
    const strings = vgLiteLang.HeroCreation
    const startingCoins: Coins = { g: 3, s: 0, c: 0 }
    const [wallet, setWallet] = useState<Coins>(startingCoins)
    const [selectedPack, setSelectedPack] = useState<Item & { system: StarterPackDataModel } | undefined>(undefined)
    const [cart, setCart] = useState([])

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
            console.log(refund, pack.system.cost)
            setWallet(subtractCoins(refund, pack.system.cost))
            setSelectedPack(pack)
        }
        else {
            ui.notifications?.warn("Not enough funds!")
        }
    }, [selectedPack])

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

                    {/* ITEM SHOP */}
                    <div>

                    </div>
                </div>
            </EditModeContextProvider >
        )
    }

    return { EquipmentSelection, selectedPack, wallet }
}