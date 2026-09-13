import { Eye, Hand, HandFist, MessageSquareText, Split, Sword, Trash, Undo } from "lucide-react"
import { createElement } from "react"

import { ItemStackSplitApp } from "../apps/inventory/ItemStackSplitApp"
import { HeroAttack } from "../combat/engine/HeroAttack"
import { ActorDataModel, BaseActorSchema } from "../model/actor/ActorDataModel"
import { HeroDataModel } from "../model/actor/HeroDataModel"
import { isInContainer, isInventoryItem, openItemSheet } from "../model/actor/type/Inventory"
import { Coins, subtractCoins } from "../model/common/CoinValue"
import { AlchemicalItemDataModel } from "../model/item/equip/AlchemicalItemDataModel"
import { ArmorDataModel } from "../model/item/equip/ArmorDataModel"
import { addItemToContainer, ContainerDataModel, extractItemFromContainer } from "../model/item/equip/ContainerDataModel"
import { EquipmentDataModel, EquipmentSchema, setEquipState } from "../model/item/equip/EquipmentDataModel"
import { SundryDataModel } from "../model/item/equip/SundryDataModel"
import { isEquippedWeapon, WeaponDataModel } from "../model/item/equip/WeaponDataModel"
import { ItemsCache } from "../rules/util/ItemsCache"
import { sendVagabondChatMessage } from "../view/chat/ChatCardSerializer"
import { ItemChatCard } from "../view/chat/ItemChatCard"
import { CtxMenuItem } from "../view/component/ContextMenu"
import { CapacityInfo } from "../view/sheets/shared/CapacityGauge"
import { sys_id } from "./foundryUtils"
import { appLang } from "./lang"
import { getFullItem, getId, getName } from "./modelUtil"

/**
 * Use this function for programatically adding items to Actors. It mimics
 * the same kind of behaviour as dragging/dropping an item by setting some
 * important flags.
 * @param actor 
 * @param uuid 
 * @returns 
 */
export async function addItems(actor: Actor & { system: any }, uuids: string[]) {
    const items: any[] = []

    for (const uuid of uuids) {
        if (!uuid) continue

        const cachedItem = ItemsCache.items.get(uuid)
        const fullItem = await getFullItem(cachedItem ?? uuid)
        if (!fullItem) continue

        const itemData = fullItem.toObject() as any
        itemData._stats = {
            ...itemData._stats,
            compendiumSource: uuid
        }

        itemData.flags = {
            ...itemData.flags,
            core: {
                ...itemData.flags?.core,
                sourceId: uuid
            }
        }

        items.push(itemData)
    }

    if (items.length > 0) {
        await actor.createEmbeddedDocuments("Item", items)
    }
}

export function getEquippedArmor(hero: any): (Item & { system: ArmorDataModel }) | undefined {
    const items = hero?.parent?.items ?? hero?.items ?? []
    return items.find((it: any) => it.type === "armor" && it.system.isEquipped)
}

export async function equipArmor(hero: any, armor: ArmorDataModel) {
    const equippedArmor = getEquippedArmor(hero)

    if (equippedArmor) {
        if (equippedArmor.system.isCursed() && !game.user?.isActiveGM) {
            ui.notifications?.info(`${hero.parent.name} is unable to remove bound item: ${equippedArmor.name}...`)
        }
        else {
            await setEquipState(hero, equippedArmor, false)
            await armor.parent.update({ "system.isEquipped": true })
        }
    }
    else {
        await setEquipState(hero, armor, true)
    }
}

export function getEquippedWeapons(actor: Actor & { system: any }) {
    return actor.items.filter(i => isEquippedWeapon(i.system)).map(w => (
        { value: w.uuid, label: w.name }
    ))
}

/**
 * Shows a UI warning notification if the Hero doesn't have enough
 * free hands available to equip the given weapon.
 * @param hero
 * @param item 
 */
export async function equipWeapon(hero: any, item: WeaponDataModel | SundryDataModel) {
    if (item instanceof SundryDataModel && item.isWearable) {
        item.parent.update({ 'system.isEquipped': true })
    }
    else if (item.bulk.totalSlots > 0 && occupiedWeaponSlots(hero) + item.bulk.totalSlots > hero.inventory.weaponSlots) {
        ui.notifications?.warn("Cannot equip any more weapons or tools!")
    }
    else {
        const updates = { 'system.isEquipped': true }
        if (item instanceof WeaponDataModel) {
            updates['system.grip.state'] = ['V', 'H'].includes(item.grip.style) ? 'H' : (item.grip.style === 'HH' ? 'HH' : '-')
        }
        item.parent.update(updates)
    }
}

const occupiedWeaponSlots = (hero: any): number => {
    const equippedWeapons = hero.parent.items.filter((it: any) => it.type === "weapon" && it.system.isEquipped)
    const equippedSundries = hero.parent.items.filter((it: any) => it.type === "sundry" && it.system.isEquipped && !it.system.isWearable)
    return [...equippedWeapons, ...equippedSundries].reduce((sum, it) => {
        return sum + it.system.bulk.totalSlots
    }, 0)
}

/**
 * Toggles Versatile weapons between H and and HH mode. If
 * the Hero doesn't have a free hand availalble, a UI warning
 * notification is shown to the user.
 * @param hero
 * @param item
 */
export async function toggleGripState(item: WeaponDataModel | SundryDataModel) {
    if (item instanceof SundryDataModel) return

    if (item.grip.style === 'V') {
        if (item.grip.state === 'H') {
            item.parent.update({ 'system.grip.state': 'HH' })
        }
        else {
            item.parent.update({ 'system.grip.state': 'H' })
        }
    }
}

export const getEncumbranceInfo = (hero: any): CapacityInfo => {
    const capacity = hero.inventory.capacity ?? 10
    const bulk = hero.inventory.items.filter(i => !isInContainer(i, getContainers(hero))).reduce((sum, i) => { return sum + (i.bulk.totalSlots ?? 0) }, 0)
    const isOverEncumbered = bulk / capacity > 1
    return { bulk, capacity, isOverEncumbered }
}

export const getContainers = (hero: any): ContainerDataModel[] => {
    return hero.parent.items.filter(it => it.type === 'container').map(it => it.system as ContainerDataModel[])
}

export const stackStackables = async (hero: any) => {
    const stackables = hero.parent.items?.filter((it: any) => isInventoryItem(it) && it.system.bulk.isStackable) as (Item & { system: EquipmentDataModel<EquipmentSchema> })[]
    if (stackables?.length > 0) {
        const stackGroups: { id: string, items: (Item & { system: EquipmentDataModel<EquipmentSchema> })[] }[] = []

        for (const stack of stackables) {
            const stackId = stack.flags[sys_id]?.["item-stack-id"] ?? stack.name
            const existing = stackGroups[stackId]
            if (existing) {
                existing.items.push(stack)
            }
            else {
                stackGroups.push({ id: stackId, items: [stack] })
            }
        }

        for (const group of stackGroups) {
            if (group.items.length > 1) {
                await group.items[0].update({ 'system.bulk.quantity': group.items.reduce((sum, it) => { return sum + it.system.bulk.quantity }, 0) } as Record<string, number>)
                await deleteItems(hero, group.items?.slice(1)?.map(it => it._id!))
            }
        }
    }
}

export const useItem = async (
    actor: Actor & { system: HeroDataModel },
    item: Item & { system: AlchemicalItemDataModel | SundryDataModel },
    skipDeletion?: boolean
) => {
    const sendToChat = () => {
        sendVagabondChatMessage(actor, createElement(ItemChatCard, {
            actorId: getId(actor),
            itemId: getId(item),
            itemName: getName(item),
            isConsumable: item.system.isConsumable
        }))
    }

    if (item) {
        if (item.system instanceof AlchemicalItemDataModel) {
            if (!skipDeletion) await deleteItems(actor, [getId(item)])

            if (item.system.damage.dice.count > 0) {
                const attack = HeroAttack.buildAlchemyAttack(actor, item as Item & { system: AlchemicalItemDataModel })
                attack.initiate()
            }
            else {
                sendToChat()
            }
        }
        else if (item.system instanceof SundryDataModel) {
            if (item.system.isConsumable) {
                if (!skipDeletion) await deleteItems(actor, [getId(item)])
            }
            sendToChat()
        }
    }
    else {
        ui.notifications?.warn("Item not found!")
    }
}

export const sendItemToChat = (hero: any, item: EquipmentDataModel<EquipmentSchema>) => {
    sendVagabondChatMessage(hero, createElement(ItemChatCard, {
        actorId: getId(hero), itemId: getId(item), itemName: getName(item)
    }))
}

export const equippedItemContextMenu = (hero: any, item: WeaponDataModel | SundryDataModel): CtxMenuItem[] => {
    const menuItems: CtxMenuItem[] = []
    if (item instanceof WeaponDataModel) {
        menuItems.push({
            icon: Sword,
            label: 'Attack',
            action: () => {
                HeroAttack.buildWeaponAttack(hero.parent, item.parent).initiate()
            }
        })
        if (item.grip.style === 'V') {
            menuItems.push(
                { icon: HandFist, label: 'Change grip', action: () => toggleGripState(item) }
            )
        }
    }

    menuItems.push(
        { icon: Hand, label: 'Unequip', action: () => setEquipState(hero, item, false) }
    )
    return menuItems
}

export const equipmentContextMenuItems = (hero: any, item: EquipmentDataModel<EquipmentSchema>): CtxMenuItem[] => {
    const menuItems: CtxMenuItem[] = []
    if (item.isEquippable) {
        if (item.isEquipped) {
            if (item instanceof WeaponDataModel && item.grip.style === 'V') {
                menuItems.push({
                    icon: HandFist, label: appLang.HeroSheet.Inventory.ctxGrip, action: () => toggleGripState(item)
                })
            }
            menuItems.push({
                icon: Hand, label: appLang.HeroSheet.Inventory.ctxUnequip, action: () => setEquipState(hero, item, false)
            })
        }
        else {
            menuItems.push({
                icon: HandFist, label: appLang.HeroSheet.Inventory.ctxEquip, action: async () => {
                    item instanceof WeaponDataModel || item instanceof SundryDataModel
                        ? equipWeapon(hero, item)
                        : (item instanceof ArmorDataModel
                            ? await equipArmor(hero, item as ArmorDataModel)
                            : await setEquipState(hero, item, true)
                        )
                }
            })
        }
    }
    else if (item.isConsumable) {
        menuItems.push(useItemContextOption(hero.parent, item.parent))
    }
    menuItems.push(
        viewItemSheetContextOption(item),
        sendItemToChatContextOption(hero, item),
    )

    if (item.bulk.isStackable && item.bulk.quantity > 1) {
        menuItems.push(splitItemsContextOption(hero, item))
    }

    menuItems.push(deleteItemContextOption(hero, item))

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
        menuItems.push(useItemContextOption(actor.parent, item.parent))
    }
    menuItems.push(viewItemSheetContextOption(item))
    menuItems.push({ icon: Undo, label: appLang.HeroSheet.Inventory.ctxExtract, action: () => extractItemFromContainer(container, item.parent) })
    menuItems.push(deleteItemContextOption(actor, item))
    if (item.bulk.isStackable && item.bulk.quantity > 1) {
        menuItems.push(deleteAllItemsContextOption(actor, item))
    }
    return menuItems
}

const useItemContextOption = (hero: Actor & { system: HeroDataModel }, item: Item & { system: AlchemicalItemDataModel | SundryDataModel }) => {
    return { icon: Hand, label: appLang.HeroSheet.Inventory.ctxUse, action: () => useItem(hero, item) }
}

const viewItemSheetContextOption = (item: EquipmentDataModel<EquipmentSchema>) => {
    return { icon: Eye, label: appLang.HeroSheet.Inventory.ctxView, action: () => openItemSheet(item) }
}

const sendItemToChatContextOption = (hero: any, item: EquipmentDataModel<EquipmentSchema>) => {
    return { icon: MessageSquareText, label: appLang.HeroSheet.Inventory.ctxChat, action: () => sendItemToChat(hero, item) }
}

const splitItemsContextOption = (hero: any, item: EquipmentDataModel<EquipmentSchema>) => {
    return { icon: Split, label: appLang.HeroSheet.Inventory.ctxSplit, action: () => new ItemStackSplitApp(hero.parent, item.parent).render({ force: true }) }
}

const deleteItemContextOption = (actor: ActorDataModel<BaseActorSchema> | null, item: EquipmentDataModel<EquipmentSchema>) => {
    return { icon: Trash, label: appLang.HeroSheet.Inventory.ctxDelete, action: () => deleteItems(actor, [getId(item)]), isDestructive: true }
}

const deleteAllItemsContextOption = (actor: ActorDataModel<BaseActorSchema> | null, item: EquipmentDataModel<EquipmentSchema>) => {
    return {
        icon: Trash,
        label: appLang.HeroSheet.Inventory.ctxDeleteAll,
        action: async () => {
            await item.parent.update({ 'system.bulk.isStackable': false, 'system.bulk.quantity': 0 })
            deleteItems(actor, [getId(item)])
        },
        isDestructive: true
    }
}

export const deleteItems = async (actor: any, itemIds: string[]) => {
    if (!actor) return

    if (actor.parent) {
        return await actor.parent.deleteEmbeddedDocuments("Item", itemIds, { deleteVagabondStack: false })
    }
    else {
        return await actor.deleteEmbeddedDocuments("Item", itemIds, { deleteVagabondStack: false })
    }
}

export const deleteItemStack = async (actor: any, itemIds: string[]) => {
    if (!actor) return

    if (actor.parent) {
        await actor.parent.deleteEmbeddedDocuments("Item", itemIds, { deleteVagabondStack: true })
    }
    else {
        await actor.deleteEmbeddedDocuments("Item", itemIds, { deleteVagabondStack: true })
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

        if (dragItem.bulk.isStackable && targetItem.bulk.isStackable && dragItem.parent.name === targetItem.parent.name) {
            await targetItem.parent.update({ 'system.bulk.quantity': targetItem.bulk.quantity + dragItem.bulk.quantity })
            await deleteItemStack(actor, [dragItem.parent.id])
        }
        else if (dragItem.parent.id !== targetItem.parent.id) {
            await actor?.parent?.updateEmbeddedDocuments("Item", sortingUpdate)
        }
    }
}

export const subtractCoinsFromHero = (hero: HeroDataModel, coins: Coins) => {
    const newCoins = subtractCoins(hero.inventory.coins, coins)
    return hero.parent.update({ system: { inventory: { coins: newCoins } } })
}

export const getAlchemyMaterials = (actor: Actor & { system: HeroDataModel }): (Item & { system: SundryDataModel })[] => {
    return actor.items.filter(it => it.system instanceof SundryDataModel && it.system.isMaterials) as (Item & { system: SundryDataModel })[]
}

export const hasAlchemyToolsEquipped = (actor: HeroDataModel): boolean => {
    return actor.inventory.items.some(it => it instanceof SundryDataModel && it.isAlchemyTools && it.isEquipped)
}

export const removeStackableItemFromHero = (actor: HeroDataModel, stackableItem: any) => {
    if (stackableItem.system.bulk.quantity > 1) {
        return stackableItem.update({ "system.bulk.quantity": stackableItem.system.bulk.quantity - 1 })
    }
    else {
        return deleteItems(actor, [stackableItem.id])
    }
}