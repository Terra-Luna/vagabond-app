import { Sword, HandFist, Hand, Eye, MessageSquareText, Trash, Undo } from "lucide-react"
import { createElement } from "react"
import { ArmorDataModel } from "../model/item/equip/ArmorDataModel"
import { setEquipState, EquipmentDataModel, EquipmentSchema } from "../model/item/equip/EquipmentDataModel"
import { gripStateDamage, WeaponDataModel } from "../model/item/equip/WeaponDataModel"
import { DamageRollChatCard } from "../view/chat/DamageRollChatCard"
import { CtxMenuItem } from "../view/component/ContextMenu"
import { lang } from "./lang"
import { getId, getName, getTargets } from "./modelUtil"
import { isInContainer, isInventoryItem, openItemSheet } from "../model/actor/type/Inventory"
import { AlchemicalItemDataModel } from "../model/item/equip/AlchemicalItemDataModel"
import { addItemToContainer, ContainerDataModel, extractItemFromContainer } from "../model/item/equip/ContainerDataModel"
import { ItemChatCard } from "../view/chat/ItemChatCard"
import { CapacityInfo } from "../view/sheets/shared/CapacityGauge"
import { groupBy } from "./collectionUtil"
import { ActorDataModel, BaseActorSchema } from "../model/actor/ActorDataModel"
import { HeroDataModel } from "../model/actor/HeroDataModel"
import { StarterPackDataModel } from "../model/item/equip/StarterPackDataModel"
import { sendVgLiteChatMessage } from "../view/chat/ChatCardSerializer"
import { DamageRoll } from "../combat/engine/DamageRoll"
import { parseFormulaToDiceRoll } from "../combat/engine/util/dice-utils"

export async function equipArmor(hero: HeroDataModel, armor: ArmorDataModel) {
    const equippedArmor = hero.parent.items.filter((it: any) => it.type === "armor" && it.system.isEquipped)
    equippedArmor.forEach(async (it: any) => {
        await setEquipState(it, false)
    })
    await setEquipState(armor, true)
}

/**
 * Shows a UI warning notification if the Hero doesn't have enough
 * free hands available to equip the given weapon.
 * @param hero
 * @param weapon 
 */
export async function equipWeapon(hero: HeroDataModel, weapon: WeaponDataModel) {
    const equippedWeapons = hero.parent.items.filter((it: any) => it.type === "weapon" && it.system.isEquipped)
    const fistWeapons = equippedWeapons.filter((it: any) => it.system.grip.style === 'F')
    const heldWeapons = equippedWeapons.filter((it: any) => it.system.grip.style !== 'F')
    const openFists = 2 - fistWeapons.length
    const openHands = 2 - (heldWeapons.length === 0 ? 0 : (
        heldWeapons.length === 2 ? 2 : (
            heldWeapons[0].system.grip.state === 'HH' ? 2 : 1
        )
    ))

    if (weapon.grip.style === 'F' && openFists > 0) {
        weapon.parent.update({ 'system.isEquipped': true })
        weapon.parent.update({ 'system.grip.state': 'F' })
    }
    else if ((weapon.grip.style === 'H' || weapon.grip.style === 'V') && openHands > 0) {
        weapon.parent.update({ 'system.isEquipped': true })
        weapon.parent.update({ 'system.grip.state': 'H' })
    }
    else if (weapon.grip.style === 'HH' && openHands > 1) {
        weapon.parent.update({ 'system.isEquipped': true })
        weapon.parent.update({ 'system.grip.state': 'HH' })
    }
    else {
        ui.notifications?.warn("Cannot equip any more weapons!")
    }
}

/**
 * Toggles Versatile weapons between H and and HH mode. If
 * the Hero doesn't have a free hand availalble, a UI warning
 * notification is shown to the user.
 * @param hero
 * @param weapon
 */
export async function toggleGripState(hero: HeroDataModel, weapon: WeaponDataModel) {
    if (weapon.grip.style === 'V') {
        if (weapon.grip.state === 'H') {
            const equppedWeapons = hero.parent.items.filter((it) =>
                it.type === 'weapon' && it.system.isEquipped && it.system.grip.style != 'F'
            )
            if (equppedWeapons.length > 1) {
                ui.notifications?.warn("Unequip another 1H weapon before 2-handing.")
            }
            else {
                weapon.parent.update({ 'system.grip.state': 'HH' })
            }
        }
        else {
            weapon.parent.update({ 'system.grip.state': 'H' })
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
                flatDmgBonus: hero.modifiers.damage.attack ?? 0,
                perDieDmgBonus: hero.modifiers.damage.attackPerDie ?? 0
            }).roll()
            sendVgLiteChatMessage(hero, createElement(DamageRollChatCard, {
                actorId: getId(hero), tokenIds: getTargets(), result: dmgRoll
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

export const weaponContextMenuItems = (hero: HeroDataModel, weapon: WeaponDataModel): CtxMenuItem[] => {
    const menuItems: CtxMenuItem[] = [
        {
            icon: Sword,
            label: 'Attack',
            action: async () => {
                const dmgRoll = await new DamageRoll({
                    atkName: getName(weapon),
                    dmgType: weapon.damage.type,
                    dice: [parseFormulaToDiceRoll(gripStateDamage(weapon))],
                    flatDmgBonus: hero.modifiers.damage.attack ?? 0,
                    perDieDmgBonus: hero.modifiers.damage.attackPerDie ?? 0
                }).roll()

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