import { Eye, Hand, HandFist, MessageSquareText, Sword, Trash, Undo } from "lucide-react"
import { createElement } from "react"
import { rollDamage, rollWeaponDamage } from "../../../combat/dice-rolls"
import { groupBy } from "../../../utils/collectionUtil"
import { getId, getName, getTargets } from "../../../utils/modelUtil"
import { sendVgLiteChatMessage } from "../../../view/chat/ChatCardManager"
import { DamageRollChatCard } from "../../../view/chat/DamageRollChatCard"
import { ItemChatCard } from "../../../view/chat/ItemChatCard"
import { CtxMenuItem } from "../../../view/component/ContextMenu"
import { coinSchema } from "../../common/CoinValue"
import { fields, requiredInteger } from "../../common/sharedSchemas"
import { ArmorDataModel, equipArmor } from "../../item/equip/ArmorDataModel"
import { EquipmentDataModel, EquipmentSchema, setEquipState } from "../../item/equip/EquipmentDataModel"
import { WeaponDataModel, equipWeapon, toggleGripState } from "../../item/equip/WeaponDataModel"
import { HeroDataModel } from "../HeroDataModel"
import { AlchemicalItemDataModel } from "../../item/equip/AlchemicalItemDataModel"
import { ContainerDataModel, addItemToContainer, extractItemFromContainer } from "../../item/equip/ContainerDataModel"
import { CapacityInfo } from "../../../view/sheets/shared/CapacityGauge"
import { ActorDataModel, BaseActorSchema } from "../ActorDataModel"
import { lang } from "../../../utils/lang"

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

export const getEncumbranceInfo = (hero: HeroDataModel): CapacityInfo => {
    const capacity = hero.inventory.capacity ?? 10
    const bulk = hero.inventory.items.filter(i => !isInContainer(i, getContainers(hero))).reduce((sum, i) => { return sum + (i.bulk.totalSlots ?? 0) }, 0)
    const isOverEncumbered = bulk / capacity > 1
    return { bulk, capacity, isOverEncumbered }
}

export const setInventoryData = (hero: HeroDataModel) => {
    hero.inventory.items = hero.parent.items.filter((i: any) => isInventoryItem(i)).map((i: any) => i.system)
    hero.inventory.capacity = Number(hero.stats.might) + 8 - hero.fatigue!
}

export const getContainers = (hero: HeroDataModel): ContainerDataModel[] => {
    return hero.parent.items.filter(it => it.type === 'container').map(it => it.system as ContainerDataModel[])
}

export const isInContainer = (item, containers) => {
    return containers.find(c => c.itemIds.includes(item?.parent?.id ?? item.id)) !== undefined
}

export const stackStackables = async (hero: HeroDataModel) => {
    const stackables = hero.parent.items?.filter((it: any) => isInventoryItem(it) && it.system.bulk.isStackable) as Item[]
    if (stackables?.length > 0) {
        ((Object.values(groupBy('name', stackables))) as any[][]).filter(it => it.length > 1).forEach(async items => {
            await items[0].update({ 'system.bulk.quantity': items.length })
            await deleteItems(
                hero,
                items.filter(it => it.system.bulk.quantity === 1).map(it => it._id)
            )
        })
    }
}

export const itemNameQty = (item: EquipmentDataModel<EquipmentSchema>): string => {
    let name = getName(item)
    if (item instanceof ContainerDataModel) {
        name += ` (${(item.capacity) - item.emptySlots}/${item.capacity})`
    }
    else {
        item.bulk.quantity > 1 ? name += ` (x${item.bulk.quantity})` : {}
    }
    return name
}

export const sortedItems = <T>(items: EquipmentDataModel<EquipmentSchema>[]): T[] => {
    return items.sort((a: any, b: any) => a.parent.sort === 0 ? 999999 : a.parent.sort - b.parent.sort) as T[]
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
        if (item instanceof AlchemicalItemDataModel && item.damage.type !== 'none') {
            const damageRoll = await rollDamage(
                getName(item),
                item.damage.type ?? 'none',
                item.damage.oneHand,
                0,
                item.explodeData.canExplode,
                item.explodeData.explodesOn as number[],
                item.damage.appliesBurn,
                item.damage.burnCountdown
            )
            sendVgLiteChatMessage(hero, createElement(DamageRollChatCard, {
                actorId: getId(hero), tokenIds: getTargets(), result: damageRoll
            }))
        }
        else {
            sendVgLiteChatMessage(hero, createElement(ItemChatCard, {
                itemId: getId(item), itemName: `Used: ${getName(item)}`, isConsumable: item.isConsumable
            }))
        }
    }
    else {
        ui.notifications?.warn("Item not found!")
    }
}

export const sendItemToChat = (hero: HeroDataModel, item: EquipmentDataModel<EquipmentSchema>) => {
    sendVgLiteChatMessage(hero, createElement(ItemChatCard, { itemId: getId(item), itemName: getName(item) }))
}

export const equipItem = (hero: HeroDataModel, item: EquipmentDataModel<EquipmentSchema>) => {
    if (item.parent instanceof ArmorDataModel) {
        equipArmor(hero, item as ArmorDataModel)
    }
    else if (item.parent instanceof WeaponDataModel) {
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

export const deleteItems = async (actor: ActorDataModel<BaseActorSchema> | null, itemIds: string[]) => {
    await actor?.parent?.deleteEmbeddedDocuments("Item", itemIds)
}

export const deleteItemStack = async (actor: ActorDataModel<BaseActorSchema> | null, itemIds: string[]) => {
    for (const id of itemIds) {
        await actor?.parent.items.get(id).update({ 'system.bulk.isStackable': false, 'system.bulk.quantity': 0 })
    }
    await deleteItems(actor, itemIds)
}

export const weaponContextMenuItems = (hero: HeroDataModel, weapon: WeaponDataModel): CtxMenuItem[] => {
    const menuItems: CtxMenuItem[] = [
        {
            icon: Sword,
            label: 'Attack',
            action: async () => {
                const dmgRoll = await rollWeaponDamage(weapon)
                sendVgLiteChatMessage(hero, createElement(
                    DamageRollChatCard,
                    { actorId: getId(hero), tokenIds: getTargets(), result: dmgRoll }
                ), dmgRoll.rolls)
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
        menuItems.push(useItemContextOption(hero, item))
    }
    menuItems.push(
        viewItemSheetContextOption(item),
        sendItemToChatContextOption(hero, item),
        deleteItemContextOption(hero, item)
    )
    if (item.bulk.isStackable && item.bulk.quantity > 1) {
        menuItems.push(deleteAllItemsContextOption(hero, item))
    }
    return menuItems
}

export const containerItemContextMenuItems = (
    actor: ActorDataModel<BaseActorSchema> | null,
    item: EquipmentDataModel<EquipmentSchema>,
    container: ContainerDataModel
): CtxMenuItem[] => {
    const menuItems: CtxMenuItem[] = []
    if (item.isConsumable && actor?.parent?.type === 'hero') {
        menuItems.push(useItemContextOption(actor as HeroDataModel, item))
    }
    menuItems.push(viewItemSheetContextOption(item))
    menuItems.push({ icon: Undo, label: lang.VGLITE.HeroSheet.Inventory.ctxExtract, action: () => extractItemFromContainer(container, item.parent) })
    menuItems.push(deleteItemContextOption(actor, item))
    if (item.bulk.isStackable && item.bulk.quantity > 1) {
        menuItems.push(deleteAllItemsContextOption(actor, item))
    }
    return menuItems
}

const useItemContextOption = (hero: HeroDataModel, item: EquipmentDataModel<EquipmentSchema>) => {
    return { icon: Hand, label: lang.VGLITE.HeroSheet.Inventory.ctxUse, action: () => useItem(hero, item) }
}

const viewItemSheetContextOption = (item: EquipmentDataModel<EquipmentSchema>) => {
    return { icon: Eye, label: lang.VGLITE.HeroSheet.Inventory.ctxView, action: () => openItemSheet(item) }
}

const sendItemToChatContextOption = (hero: HeroDataModel, item: EquipmentDataModel<EquipmentSchema>) => {
    return { icon: MessageSquareText, label: lang.VGLITE.HeroSheet.Inventory.ctxChat, action: () => sendItemToChat(hero, item) }
}

const deleteItemContextOption = (actor: ActorDataModel<BaseActorSchema> | null, item: EquipmentDataModel<EquipmentSchema>) => {
    return { icon: Trash, label: lang.VGLITE.HeroSheet.Inventory.ctxDelete, action: () => deleteItems(actor, [getId(item)]), isDestructive: true }
}

const deleteAllItemsContextOption = (actor: ActorDataModel<BaseActorSchema> | null, item: EquipmentDataModel<EquipmentSchema>) => {
    return {
        icon: Trash,
        label: lang.VGLITE.HeroSheet.Inventory.ctxDeleteAll,
        action: async () => {
            await item.parent.update({ 'system.bulk.isStackable': false, 'system.bulk.quantity': 0 })
            deleteItems(actor, [getId(item)])
        },
        isDestructive: true
    }
}

/**
 * Updates the given items' sort properties according to user preference.
 * Places items into containers.
 * @param actor 
 * @param dragItem 
 * @param targetItem 
 * @param siblings 
 */
export const inventoryItemDragDropHandler = async (
    actor: ActorDataModel<BaseActorSchema> | null,
    dragItem: EquipmentDataModel<EquipmentSchema>,
    targetItem: EquipmentDataModel<EquipmentSchema>,
    siblings: EquipmentDataModel<EquipmentSchema>[]
) => {
    if (actor === undefined) return
    if (targetItem.parent.type === 'container' && dragItem.parent.type !== 'container' && !dragItem.isEquipped) {
        addItemToContainer(targetItem as ContainerDataModel, dragItem.parent)
    }
    else {
        const sortBefore = siblings.indexOf(targetItem) < siblings.indexOf(dragItem)
        const sorted = foundry.utils.performIntegerSort(dragItem.parent, {
            target: targetItem.parent,
            sortBefore: sortBefore,
            siblings: siblings.map(it => it.parent)
        })
        const sortingUpdate = sorted.map((it: any) => {
            const update = it.update
            update._id = it.target._id
            return update
        })
        await actor?.parent?.updateEmbeddedDocuments("Item", sortingUpdate)
    }
}