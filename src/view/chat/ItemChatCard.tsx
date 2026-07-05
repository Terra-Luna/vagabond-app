import ArmorDataModel from "../../model/item/equip/ArmorDataModel"
import EquipmentDataModel, { EquipmentSchema } from "../../model/item/equip/EquipmentDataModel"
import WeaponDataModel from "../../model/item/equip/WeaponDataModel"
import { lang } from "../../utils/lang"
import { getName, getPortrait } from "../../utils/modelUtil"
import { DamageTypeIcon } from "../component/DamageTypeIcon"
import { EnrichedContent } from "../component/EnrichedContent"
import { Tooltip } from "../component/Tooltip"
import { ItemValue } from "../sheets/item/equip/EquipmentSheetComponent"
import { BaseChatCardHost } from "./component/BaseChatCardHost"
import { ChatCardBanner } from "./component/ChatCardBanner"

export const ItemChatCard = ({ itemId, itemName, isConsumable = false }: {
    itemId: string, itemName: string, isConsumable?: boolean
}) => {
    const actor = game.actors?.find(it => it.items.has(itemId))
    const item = actor?.items.get(itemId) ?? game.items?.get(itemId) ?? game.items?.getName(itemName)
    const equipment = item?.system as EquipmentDataModel<EquipmentSchema>
    if (equipment === undefined) return <p className="font-xs font-paradigm font-normal italic">Item removed</p>
    return (
        <BaseChatCardHost
            banner={<ChatCardBanner tokenId={actor?.getActiveTokens()[0]?.id} portrait={getPortrait(item)} title={isConsumable ? `Used: ${getName(item)}` : `${getName(item)}`} />}
            contents={
                <div className="font-paradigm font-normal text-lg">
                    <EnrichedContent content={equipment.description} />
                    <ItemCardContents item={equipment} />
                </div>
            }
        />
    )
}

const ItemCardContents = ({ item }: { item: EquipmentDataModel<EquipmentSchema> }) => {
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
                item.properties.map(prop => (
                    <Tooltip key={prop} text={lang.VGLITE.WeaponProps[prop].description}>
                        <p className="italic">{item.properties.map(it => lang.VGLITE.WeaponProps[it].name).join(", ")}</p>
                    </Tooltip>
                ))
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