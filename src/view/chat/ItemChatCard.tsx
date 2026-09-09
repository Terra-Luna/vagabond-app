import { useEffect, useState } from "react"

import { Coins, coinsAsString } from "../../model/common/CoinValue"
import { AlchemicalItemDataModel } from "../../model/item/equip/AlchemicalItemDataModel"
import { EquipmentDataModel, EquipmentSchema } from "../../model/item/equip/EquipmentDataModel"
import { ItemsCache } from "../../rules/util/ItemsCache"
import { appLang } from "../../utils/lang"
import { CombinedItemsAll, getFullItem, getTokenImg } from "../../utils/modelUtil"
import { SkillCard } from "../component/SkillCard"
import { EditModeContextProvider } from "../context/EditModeContext/EditModeContext"
import { EditModeOptions } from "../context/EditModeContext/EditModeOptions"
import { EquipmentSheetComponent } from "../sheets/item/equip/EquipmentSheetComponent"
import { BaseChatCardHost } from "./component/BaseChatCardHost"
import { ChatCardBanner } from "./component/ChatCardBanner"

export const ItemChatCard = ({ actorId, itemId, itemName, isConsumable = false }: {
    actorId: string, itemId: string, itemName: string, isConsumable?: boolean
}) => {
    const actor = game.actors?.get(actorId)
    const item = actor?.items.get(itemId) ?? ItemsCache.allItems().find(it => it.id === itemId) ?? null

    const [equipment, setEquipment] = useState<EquipmentDataModel<EquipmentSchema> | null>(
        item ? (item.system as EquipmentDataModel<EquipmentSchema>) : null
    )

    /**
     * If the actor ditched the item since it was link, try to find a matching game item...
     * Don't convert this ItemChatCard component to async or else the chat card rehydrator
     * won't be able to render it.
     */
    useEffect(() => {
        if (item) return
        let isMounted = true

        async function fetchFallbackItem() {
            try {
                const items = await CombinedItemsAll()

                // Look for ID match
                let matchedItem = items.find(it => it._id === itemId) ?? null
                let fullItem = await getFullItem<EquipmentDataModel<EquipmentSchema>>(matchedItem)

                // Matching by Name if ID fails
                if (!fullItem) {
                    matchedItem = items.find(it => it.name === itemName) ?? null
                    fullItem = await getFullItem<EquipmentDataModel<EquipmentSchema>>(matchedItem)
                }

                if (isMounted && fullItem) {
                    setEquipment(fullItem.system as EquipmentDataModel<EquipmentSchema>)
                }
            }
            catch (error) {
                console.error("Failed to rehydrate chat card item:", error)
            }
        }

        fetchFallbackItem()

        return () => { isMounted = false }
    }, [item, itemId, itemName])

    return (
        <>
            {item && equipment &&
                <BaseChatCardHost
                    banner={
                        <ChatCardBanner
                            tokenId={actor?.getActiveTokens()[0]?.id}
                            portrait={getTokenImg(actor)}
                            title={`${isConsumable ? 'Used' : 'Linked'} Item`}
                        />
                    }
                    contents={<>
                        {item &&
                            <div>
                                <EditModeContextProvider initialEditMode={EditModeOptions.NEVER}>
                                    {equipment instanceof AlchemicalItemDataModel
                                        ? <span className="font-normal"><SkillCard
                                            title={item.name}
                                            subtitles={[
                                                { label: appLang.HeroSheet.Alchemy.category, value: appLang.AlchemyCategories[(item.system as any).alchemyCategory].name },
                                                { label: appLang.ItemSheet.value, value: coinsAsString((item.system as any).value as Coins) }
                                            ]}
                                            description={(item.system as any).description}
                                            startCollapsed={false}
                                        /></span>
                                        : <EquipmentSheetComponent item={equipment.parent} hideBottomSection={true} />
                                    }
                                </EditModeContextProvider>
                            </div>
                        }
                    </>}
                />
            }
        </>
    )
}