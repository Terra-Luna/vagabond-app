import { useEffect, useState } from "react"

import { DiceRoll } from "../../combat/engine/roll/DiceRoll"
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
                                <EnrichedContent content={equipment.description} actor={actor} />
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
            <ItemCardProp label={lang.APP.ItemSheet.type} children={lang.APP.ArmorTypes[item.armorType].name} />
            <ItemCardProp label={lang.APP.ItemSheet.armor} children={item.rating} />
            <ItemCardProp label={lang.APP.ItemSheet.material} children={lang.APP.Metals[item.material].name} />
        </ItemCardBody>
    )
}

const WeaponCardContents = ({ item }: { item: WeaponDataModel }) => {
    return (
        <ItemCardBody item={item}>
            <div className="flex space-x-2">
                <ItemCardProp label={lang.APP.ItemSheet.dmg} children={
                    <ItemCardValue children={new DiceRoll(item.damage.dice as any).toRollFormula()} />
                } />
                <DamageTypeIcon dmgType={item.damage.type as string} size={18} />
            </div>
            <ItemCardProp label={lang.APP.ItemSheet.props} children={
                <div className="flex gap-x-1">
                    <p className="italic">{item.skills.map(sk => lang.APP.WeaponSkills[sk].name).join(", ")}</p>
                    <p>|</p>
                    <p className="italic">{item.properties.map(sk => lang.APP.WeaponProps[sk].name).join(", ")}</p>
                </div>
            } />
            <ItemCardProp label={lang.APP.ItemSheet.range} children={lang.APP.Ranges[item.range]} />
            <ItemCardProp label={lang.APP.ItemSheet.material} children={lang.APP.Metals[item.material].name} />
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