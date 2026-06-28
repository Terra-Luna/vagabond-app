import lang from "../../../public/lang/en.json"
import ArmorDataModel from "../../model/item/equip/ArmorDataModel"
import EquipmentDataModel, { EquipmentSchema } from "../../model/item/equip/EquipmentDataModel"
import WeaponDataModel from "../../model/item/equip/WeaponDataModel"
import { getName, getPortrait } from "../../utils/modelUtil"
import { EnrichedContent } from "../component/EnrichedContent"
import { BaseChatCardHost } from "./component/BaseChatCardHost"
import { ChatCardBanner } from "./component/ChatCardBanner"

export const ItemChatCard = ({ itemId }: { itemId: string }) => {
    const actor = game.actors?.find(it => it.items.has(itemId))
    const item = actor?.items.get(itemId)
    const equipment = item?.system as EquipmentDataModel<EquipmentSchema>
    if (equipment === undefined) return <p className="font-xs font-paradigm font-normal italic">Item removed</p>
    return (
        <BaseChatCardHost
            banner={<ChatCardBanner portrait={getPortrait(item)} title={getName(item)} />}
            contents={
                <div>
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
            <ItemCardBody>
                <div>

                </div>
            </ItemCardBody>
        )
    }
}

const ArmorCardContents = ({ item }: { item: ArmorDataModel }) => {
    return (
        <ItemCardBody>
            <p>{item.armorType}</p>
            <p>{item.rating}</p>
            <p>{item.material}</p>
        </ItemCardBody>
    )
}

const WeaponCardContents = ({ item }: { item: WeaponDataModel }) => {
    return (
        <ItemCardBody>
            <p>{item.damage.oneHand}</p>
            <p>{item.damage.twoHand}</p>
            <p>{item.range}</p>
            <p>{item.damage.type}</p>
            <p>{lang.VGLITE.Metals[item.material].name}</p>
        </ItemCardBody>
    )
}

const ItemCardBody = ({ children }) => {
    return (
        <div className="text-base text-text-primary font-paradigm font-normal">
            {children}
        </div>
    )
}