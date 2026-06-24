import lang from "../../../../public/lang/en.json"
import { Eye, Hand, HandFist, MessageSquareText, Sword, Trash, Triangle } from "lucide-react"
import { groupBy } from "../../../utils/collectionUtil"
import { getId, getName } from "../../../utils/modelUtil"
import { CtxMenuItem } from "../../../view/component/ContextMenu"
import { coinSchema } from "../../common/CoinValue"
import { fields, requiredInteger } from "../../common/sharedSchemas"
import ArmorDataModel, { equipArmor } from "../../item/equip/ArmorDataModel"
import EquipmentDataModel, { EquipmentSchema, setEquipState } from "../../item/equip/EquipmentDataModel"
import WeaponDataModel, { equipWeapon, toggleGripState } from "../../item/equip/WeaponDataModel"
import HeroDataModel from "../HeroDataModel"
import { rollWeaponDamage } from "../../../combat/dice-rolls"
import { sendVgLiteChatMessage } from "../../../view/chat/ChatCardManager"
import { DamageRollCard } from "../../../view/chat/DamageRollCard"
import { createElement } from "react"

export const inventorySchema = () => {
    return {
        coins: new fields.SchemaField({ ...coinSchema() }),
        capacity: new fields.NumberField({ ...requiredInteger, initial: 2 }),
        /**
         * Derived from Actor's Embedded Documents.
         */
        items: new fields.ArrayField(new fields.SchemaField({ ...EquipmentDataModel.defineSchema() }), { initial: [] })
    }
}

export const getEncumbranceInfo = (hero: HeroDataModel): { bulk: number, capacity: number, isOverEncumbered: boolean } => {
    const capacity = hero.inventory.capacity ?? 10
    const bulk = hero.inventory.items.reduce((sum, i) => { return sum + (i.slots ?? 0) }, 0)
    const isOverEncumbered = bulk / capacity > 1
    return { bulk, capacity, isOverEncumbered }
}

export const setInventoryData = (hero: HeroDataModel) => {
    hero.inventory.items = hero.parent.items.filter((i: any) => isInventoryItem(i)).map((i: any) => i.system)
    hero.inventory.capacity = Number(hero.stats.might) + 8 - hero.fatigue!
}

export const stackStackables = async (hero: HeroDataModel) => {
    const stackables = hero.parent.items?.filter((it: any) => isInventoryItem(it) && it.system.isStackable) as Item[]
    if (stackables?.length > 0) {
        ((Object.values(groupBy('name', stackables))) as any[][]).filter(it => it.length > 1).forEach(async items => {
            await items[0].update({ 'system.quantity': items.length })
            await deleteItems(
                hero,
                items.filter(it => it.system.quantity === 1).map(it => it._id)
            )
        })
    }
}

export const itemNameQty = (item: EquipmentDataModel<EquipmentSchema>): string => {
    return item.quantity === 1 ? getName(item) : `${getName(item)} (x${item.quantity})`
}

export const sortedItems = <T>(items: T[]): T[] => {
    return items.sort((a: any, b: any) => a.parent.sort === 0 ? 999999 : a.parent.sort - b.parent.sort)
}

export const isInventoryItem = (item: any): boolean => {
    return item.type === 'armor' ||
        item.type === 'weapon' ||
        item.type === 'tool' ||
        item.type === 'sundry' ||
        item.type === 'alchemical' ||
        item.type === 'container'
}

export const useItem = async (hero: HeroDataModel, item: EquipmentDataModel<EquipmentSchema>) => {
    if (item) {
        if (item.isConsumable) {
            await deleteItems(hero, [getId(item)])
        }
        ChatMessage.create({
            speaker: { actor: getId(hero), alias: getName(hero) },
            content: `<h4>${getName(hero)} </h4><p> used item: ${getName(item)}</p>`
        })
    }
    else {
        ui.notifications?.warn("Item not found!")
    }
}

export const sendItemToChat = (hero: HeroDataModel, item: EquipmentDataModel<EquipmentSchema>) => {
    ChatMessage.create({
        speaker: { actor: getId(hero), alias: getName(hero) },
        content: `<h4>${getName(hero)} </h4><p> linked item: ${getName(item)}</p>`
    })
}

export const equipItem = (hero: HeroDataModel, item: EquipmentDataModel<EquipmentSchema>) => {
    if (item.parent.type instanceof ArmorDataModel) {
        equipArmor(hero, item as ArmorDataModel)
    }
    else if (item.parent.type instanceof WeaponDataModel) {
        equipWeapon(hero, item as WeaponDataModel)
    }
    else if (item.isEquippable) {
        setEquipState(item, true)
    }
}

export const openItemSheet = (item: EquipmentDataModel<EquipmentSchema>) => {
    if (item) {
        item.parent.sheet.render(true)
    }
    else {
        ui.notifications?.warn("Item not found!")
    }
}

export const deleteItems = async (hero: HeroDataModel, itemIds: string[]) => {
    await hero.parent.deleteEmbeddedDocuments("Item", itemIds)
}

export const weaponContextMenuItems = (hero: HeroDataModel, weapon: WeaponDataModel): CtxMenuItem[] => {
    const menuItems: CtxMenuItem[] = [
        {
            icon: Sword,
            label: 'Attack',
            action: async () => {
                const dmgRoll = await rollWeaponDamage(weapon)
                sendVgLiteChatMessage(hero, createElement(DamageRollCard, { portrait: hero.parent.prototypeToken.texture.src, result: dmgRoll }), dmgRoll.rolls)
            }
        }
    ]
    if (weapon.grip.style === 'V') {
        menuItems.push(
            { icon: HandFist, label: 'Change grip', action: () => toggleGripState(hero, weapon) }
        )
    }
    menuItems.push(
        { icon: Hand, label: 'Unequip', action: () => setEquipState(weapon, false) }
    )
    return menuItems
}

export const equipmentContextMenuItems = (hero: HeroDataModel, item: EquipmentDataModel<EquipmentSchema>): CtxMenuItem[] => {
    const menuItems: CtxMenuItem[] = []
    if (item.isEquippable) {
        if (item.isEquipped) {
            if (item instanceof WeaponDataModel && item.grip.style === 'V') {
                menuItems.push({
                    icon: HandFist, label: lang.VGLITE.HeroSheet.Inventory.ctxGrip, action: () => toggleGripState(hero, item)
                })
            }
            menuItems.push({
                icon: Hand, label: lang.VGLITE.HeroSheet.Inventory.ctxUnequip, action: () => setEquipState(item, false)
            })
        }
        else {
            menuItems.push({
                icon: HandFist, label: lang.VGLITE.HeroSheet.Inventory.ctxEquip, action: () => {
                    item instanceof WeaponDataModel ? equipWeapon(hero, item as WeaponDataModel) : (
                        item instanceof ArmorDataModel ? equipArmor(hero, item as ArmorDataModel) :
                            setEquipState(item, true)
                    )
                }
            })
        }
    }
    else if (item.isConsumable) {
        menuItems.push({
            icon: Hand, label: lang.VGLITE.HeroSheet.Inventory.ctxUse, action: () => useItem(hero, item)
        })
    }
    menuItems.push(
        { icon: Eye, label: lang.VGLITE.HeroSheet.Inventory.ctxView, action: () => openItemSheet(item) },
        { icon: MessageSquareText, label: lang.VGLITE.HeroSheet.Inventory.ctxChat, action: () => sendItemToChat(hero, item) },
        { icon: Trash, label: lang.VGLITE.HeroSheet.Inventory.ctxDelete, action: () => deleteItems(hero, [getId(item)]), isDestructive: true }
    )
    return menuItems
}