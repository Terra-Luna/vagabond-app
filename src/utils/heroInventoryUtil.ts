import { Sword, HandFist, Hand, Eye, MessageSquareText, Trash, Undo } from "lucide-react"
import { createElement } from "react"
import { ArmorDataModel } from "../model/item/equip/ArmorDataModel"
import { setEquipState, EquipmentDataModel, EquipmentSchema } from "../model/item/equip/EquipmentDataModel"
import { isEquippedWeapon, WeaponDataModel } from "../model/item/equip/WeaponDataModel"
import { DamageRollChatCard } from "../view/chat/DamageRollChatCard"
import { CtxMenuItem } from "../view/component/ContextMenu"
import { lang } from "./lang"
import { getId, getName, getTargetIds } from "./modelUtil"
import { isInContainer, isInventoryItem, openItemSheet } from "../model/actor/type/Inventory"
import { AlchemicalItemDataModel } from "../model/item/equip/AlchemicalItemDataModel"
import { addItemToContainer, ContainerDataModel, extractItemFromContainer } from "../model/item/equip/ContainerDataModel"
import { ItemChatCard } from "../view/chat/ItemChatCard"
import { CapacityInfo } from "../view/sheets/shared/CapacityGauge"
import { groupBy } from "./collectionUtil"
import { ActorDataModel, BaseActorSchema } from "../model/actor/ActorDataModel"
import { HeroDataModel } from "../model/actor/HeroDataModel"
import { StarterPackDataModel } from "../model/item/equip/StarterPackDataModel"
import { sendVagabondChatMessage } from "../view/chat/ChatCardSerializer"
import { HeroAttack } from "../combat/engine/HeroAttack"
import { ItemsCache } from "../rules/util/ItemsCache"
import { DamageRoll } from "../combat/engine/roll/DamageRoll"
import { ToolDataModel } from "../model/item/equip/ToolDataModel"

/**
 * Use this funtion for programatically adding items to Actors. It mimics
 * the same kind of behaviour as dragging/dropping an item by setting some
 * important flags.
 * @param actor 
 * @param uuid 
 * @returns 
 */
export async function addItems(actor: Actor & { system: HeroDataModel }, uuids: string[]) {
    const items: any[] = []

    for (const uuid of uuids) {
        if (!uuid) return

        const item = ItemsCache.allItems().find(it => it.uuid === uuid)
        if (!item) continue

        const itemData = item.toObject() as any
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

    await actor.createEmbeddedDocuments("Item", items)
}

export async function equipArmor(hero: HeroDataModel, armor: ArmorDataModel) {
    const equippedArmor = hero.parent.items.filter((it: any) => it.type === "armor" && it.system.isEquipped)
    equippedArmor.forEach(async (it: any) => {
        await setEquipState(it, false)
    })
    await setEquipState(armor, true)
}

export function getEquippedWeapons(actor: Actor & { system: HeroDataModel }) {
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
export async function equipWeapon(hero: HeroDataModel, item: WeaponDataModel | ToolDataModel) {
    console.log("Equipping weapon...")
    const equippedWeapons = hero.parent.items.filter((it: any) => it.type === "weapon" && it.system.isEquipped)
    const equippedTools = hero.parent.items.filter((it: any) => it.type === "tool" && it.system.isEquipped)
    const equippedSlots = [...equippedWeapons, ...equippedTools].reduce((sum, it) => { return sum + it.system.bulk.totalSlots }, 0)

    console.log(equippedSlots, [...equippedWeapons, ...equippedTools])

    if (item.bulk.totalSlots > 0 && equippedSlots + item.bulk.totalSlots > hero.inventory.weaponSlots) {
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

/**
 * Toggles Versatile weapons between H and and HH mode. If
 * the Hero doesn't have a free hand availalble, a UI warning
 * notification is shown to the user.
 * @param hero
 * @param item
 */
export async function toggleGripState(item: WeaponDataModel | ToolDataModel) {
    if (item instanceof ToolDataModel) return

    if (item.grip.style === 'V') {
        if (item.grip.state === 'H') {
            item.parent.update({ 'system.grip.state': 'HH' })
        }
        else {
            item.parent.update({ 'system.grip.state': 'H' })
        }
    }
}

export const getEncumbranceInfo = (hero: HeroDataModel): CapacityInfo => {
    const capacity = hero.inventory.capacity ?? 10
    const bulk = hero.inventory.items.filter(i => !isInContainer(i, getContainers(hero))).reduce((sum, i) => { return sum + (i.bulk.totalSlots ?? 0) }, 0)
    const isOverEncumbered = bulk / capacity > 1
    return { bulk, capacity, isOverEncumbered }
}

export const getContainers = (hero: HeroDataModel): ContainerDataModel[] => {
    return hero.parent.items.filter(it => it.type === 'container').map(it => it.system as ContainerDataModel[])
}

export const stackStackables = async (hero: HeroDataModel) => {
    const stackables = hero.parent.items?.filter((it: any) => isInventoryItem(it) && it.system.bulk.isStackable) as Item[]
    if (stackables?.length > 0) {
        ((Object.values(groupBy('name', stackables))) as any[][]).filter(it => it.length > 1).forEach(async items => {
            await items[0].update({ 'system.bulk.quantity': items.reduce((sum, it) => { return sum + it.system.bulk.quantity }, 0) })
            await deleteItems(
                hero,
                items.filter(it => it.system.bulk.quantity === 1).map(it => it._id)
            )
        })
    }
}

export const useItem = async (hero: HeroDataModel, item: EquipmentDataModel<EquipmentSchema>) => {
    if (item) {
        if (item.isConsumable) {
            await deleteItems(hero, [getId(item)])
        }
        if (item instanceof AlchemicalItemDataModel && item.damage.type !== 'none') {
            const dmgRoll = await new DamageRoll({
                atkName: getName(item),
                dice: [],
                dmgType: item.damage.type ?? 'none',
                flatDmgBonus: hero.modifiers.damage.out.attack ?? 0,
                perDieDmgBonus: hero.modifiers.damage.out.attackPerDie ?? 0
            }).roll()
            sendVagabondChatMessage(hero, createElement(DamageRollChatCard, {
                actorId: getId(hero), tokenIds: getTargetIds(), result: dmgRoll
            }))
        }
        else {
            sendVagabondChatMessage(hero, createElement(ItemChatCard, {
                itemId: getId(item), itemName: `Used: ${getName(item)}`, isConsumable: item.isConsumable
            }))
        }
    }
    else {
        ui.notifications?.warn("Item not found!")
    }
}

export const sendItemToChat = (hero: HeroDataModel, item: EquipmentDataModel<EquipmentSchema>) => {
    sendVagabondChatMessage(hero, createElement(ItemChatCard, { itemId: getId(item), itemName: getName(item) }))
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

export const equippedItemContextMenu = (hero: HeroDataModel, item: WeaponDataModel | ToolDataModel): CtxMenuItem[] => {
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
        { icon: Hand, label: 'Unequip', action: () => setEquipState(item, false) }
    )
    return menuItems
}

export const equipmentContextMenuItems = (hero: HeroDataModel, item: EquipmentDataModel<EquipmentSchema>): CtxMenuItem[] => {
    const menuItems: CtxMenuItem[] = []
    if (item.isEquippable) {
        if (item.isEquipped) {
            if (item instanceof WeaponDataModel && item.grip.style === 'V') {
                menuItems.push({
                    icon: HandFist, label: lang.VGLITE.HeroSheet.Inventory.ctxGrip, action: () => toggleGripState(item)
                })
            }
            menuItems.push({
                icon: Hand, label: lang.VGLITE.HeroSheet.Inventory.ctxUnequip, action: () => setEquipState(item, false)
            })
        }
        else {
            menuItems.push({
                icon: HandFist, label: lang.VGLITE.HeroSheet.Inventory.ctxEquip, action: () => {
                    item instanceof WeaponDataModel || item instanceof ToolDataModel
                        ? equipWeapon(hero, item)
                        : (item instanceof ArmorDataModel
                            ? equipArmor(hero, item as ArmorDataModel)
                            : setEquipState(item, true)
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

export const deleteItems = async (actor: ActorDataModel<BaseActorSchema> | null, itemIds: string[]) => {
    await actor?.parent?.deleteEmbeddedDocuments("Item", itemIds)
}

export const deleteItemStack = async (actor: ActorDataModel<BaseActorSchema> | null, itemIds: string[]) => {
    for (const id of itemIds) {
        await actor?.parent.items.get(id).update({ 'system.bulk.isStackable': false, 'system.bulk.quantity': 0 })
    }
    await deleteItems(actor, itemIds)
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

export const applyStarterPack = async (hero: HeroDataModel, pack: StarterPackDataModel) => {
    await hero.parent.createEmbeddedDocuments("Item", [pack.items])
}