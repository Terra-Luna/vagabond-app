import { useEffect, useState } from "react"
import { ArmorDataModel } from "../../model/item/equip/ArmorDataModel"
import { EquipmentDataModel, EquipmentSchema } from "../../model/item/equip/EquipmentDataModel"
import { WeaponDataModel } from "../../model/item/equip/WeaponDataModel"
import { lang } from "../../utils/lang"
import { CombinedItemsAll, getFullItem, getName, getPortrait } from "../../utils/modelUtil"
import { DamageTypeIcon } from "../component/DamageTypeIcon"
import { EnrichedContent } from "../component/EnrichedContent"
import { ItemValue } from "../sheets/item/equip/component/ItemValueComponent"
import { BaseChatCardHost } from "./component/BaseChatCardHost"
import { ChatCardBanner } from "./component/ChatCardBanner"

export const ItemChatCard = ({ itemId, itemName, isConsumable = false }: {
    itemId: string, itemName: string, isConsumable?: boolean
}) => {
    const actor = game.actors?.find(it => it.items.has(itemId))
    const item = actor?.items.get(itemId) ?? null

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
            {!equipment ? (
                <p className="font-xs font-paradigm font-normal italic">Item removed</p>
            ) : (
                    <BaseChatCardHost
                        banner={
                            <ChatCardBanner
                                tokenId={actor?.getActiveTokens()[0]?.id}
                                portrait={getPortrait(equipment)}
                                title={`${isConsumable ? 'Used:' : ''} ${getName(equipment)}`}
                            />
                        }
                        contents={
                            <div className="font-paradigm font-normal text-lg">
                                <EnrichedContent content={equipment.description} />
                                <ItemCardContents item={equipment} />
                            </div>
                        }
                    />
            )}
        </>
    )
}

const ItemCardContents = ({ item }: { item: EquipmentDataModel<EquipmentSchema> | null }) => {
    if (item instanceof ArmorDataModel) {
        return <ArmorCardContents item={item} />
    }
    else if (item instanceof WeaponDataModel) {
        return <WeaponCardContents item={item} />
    }
    else {
        return (
            <ItemCardBody item={item}>
                <div>

                </div>
            </ItemCardBody>
        )
    }
}

const ArmorCardContents = ({ item }: { item: ArmorDataModel }) => {
    return (
        <ItemCardBody item={item}>
            <ItemCardProp label={lang.VGLITE.ItemSheet.type} children={lang.VGLITE.ArmorTypes[item.armorType].name} />
            <ItemCardProp label={lang.VGLITE.ItemSheet.armor} children={item.rating} />
            <ItemCardProp label={lang.VGLITE.ItemSheet.material} children={lang.VGLITE.Metals[item.material].name} />
        </ItemCardBody>
    )
}

const WeaponCardContents = ({ item }: { item: WeaponDataModel }) => {
    return (
        <ItemCardBody item={item}>
            <div className="flex space-x-2">
                <ItemCardProp label={lang.VGLITE.ItemSheet.dmg} children={
                    item.grip.style === 'V' ?
                        <div className="flex space-x-2">
                            <ItemCardValue children={`${lang.VGLITE.Grips.H}: ${item.damage.oneHand},`} />
                            <ItemCardValue children={`${lang.VGLITE.Grips.HH}: ${item.damage.twoHand}`} />
                        </div> : (
                            item.grip.style === 'H' ?
                                <ItemCardValue children={`${lang.VGLITE.Grips.H}: ${item.damage.oneHand}`} /> :
                                <ItemCardValue children={`${lang.VGLITE.Grips.HH}: ${item.damage.twoHand}`} />
                        )
                } />
                <DamageTypeIcon dmgType={item.damage.type as string} size={18} />
            </div>
            <ItemCardProp label={lang.VGLITE.ItemSheet.props} children={
                <div className="flex gap-x-1">
                    {
                        item.weaponTypes.map(type => (
                            <p key={type} className="italic">{lang.VGLITE.WeaponTypes[type].name}</p>
                        ))
                    }
                    {
                        item.properties.map(prop => (
                            <button key={prop} title={lang.VGLITE.WeaponProps[prop].description}>
                                <p className="italic">{lang.VGLITE.WeaponProps[prop].name}</p>
                            </button>
                        ))
                    }
                </div>
            } />
            <ItemCardProp label={lang.VGLITE.ItemSheet.range} children={lang.VGLITE.Ranges[item.range]} />
            <ItemCardProp label={lang.VGLITE.ItemSheet.material} children={lang.VGLITE.Metals[item.material].name} />
        </ItemCardBody>
    )
}

const ItemCardBody = ({ item, children }) => {
    return (
        <div className="text-base text-text-primary font-paradigm font-normal">
            {children}
            <ItemValue item={item.parent} />
        </div>
    )
}

const ItemCardProp = ({ label, children }) => {
    return (
        <div className="flex space-x-2">
            <ItemCardLabel label={label} />
            <ItemCardValue children={children} />
        </div>
    )
}

const ItemCardLabel = ({ label }: { label: string }) => {
    return <p className="text-base text-text-primary font-eskapade font-bold">{`${label}:`}</p>
}

const ItemCardValue = ({ children }) => {
    return <div className="text-base text-text-secondary font-paradigm font-normal">{children}</div>
}