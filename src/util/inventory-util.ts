import { Eraser, Eye, Hand, HandFist, Link, MessageSquareText, Split, Sword, Trash, Undo } from "lucide-react"

import { ItemStackSplitApp } from "../apps/inventory/ItemStackSplitApp"
import { showConfirmationDialog } from "../apps/vagabond-tools/dialog/ConfirmationDialogUseCase"
import { RelicPowerProcessor } from "../apps/vagabond-tools/relic/RelicPowerProcessor"
import { HeroAttack } from "../combat/engine/HeroAttack"
import type { ActorDataModel, BaseActorSchema } from "../model/actor/ActorDataModel"
import type { HeroDataModel } from "../model/actor/HeroDataModel"
import { isInventoryItem, openItemSheet } from "../model/actor/schema/inventory"
import { Coins, subtractCoins } from "../model/common/coin-value-schema"
import { AlchemicalItemDataModel } from "../model/item/equip/AlchemicalItemDataModel"
import { ArmorDataModel } from "../model/item/equip/ArmorDataModel"
import type { ContainerDataModel } from "../model/item/equip/ContainerDataModel"
import { addItemToContainer, extractItemFromContainer } from "../model/item/equip/ContainerDataModel"
import type { EquipmentDataModel, EquipmentSchema } from "../model/item/equip/EquipmentDataModel"
import { SundryDataModel } from "../model/item/equip/SundryDataModel"
import { WeaponDataModel } from "../model/item/equip/WeaponDataModel"
import { ItemsCache } from "../rules/util/ItemsCache"
import { sendVagabondChatCard } from "../view/chat/ChatCardSerializer"
import type { CtxMenuItem } from "../view/component/ContextMenu"
import { sys_id } from "./foundry-util"
import { appLang } from "./lang"
import { LightSourceUtil } from "./LightSourceUtil"
import { localizeString } from "./locale-util"
import { getFullItem, getId, getName } from "./model-util"

/**
 * Use this function for programatically adding items to Actors. It mimics
 * the same kind of behaviour as dragging/dropping an item by setting some
 * important flags.
 */
export async function addItems(
  actor: Actor & { system: any },
  uuids: string[],
) {
  const items: any[] = []

  for (const uuid of uuids) {
    if (!uuid) continue

    const cachedItem = ItemsCache.items.get(uuid)
    const fullItem = await getFullItem(cachedItem ?? uuid)
    if (!fullItem) continue

    const itemData = fullItem.toObject() as any
    itemData._stats = {
      ...itemData._stats,
      compendiumSource: uuid,
    }

    itemData.flags = {
      ...itemData.flags,
      core: {
        ...itemData.flags?.core,
        sourceId: uuid,
      },
    }

    items.push(itemData)
  }

  if (items.length > 0) {
    await actor.createEmbeddedDocuments("Item", items)
  }
}

export const stackStackables = async (hero: any, recombineSplits = false) => {
  const stackables = hero.parent.items?.filter(
    (it: any) => isInventoryItem(it) && it.system.bulk.isStackable,
  ) as (Item & { system: EquipmentDataModel<EquipmentSchema> })[]
  if (stackables?.length > 0) {
    const stackGroups: {
      id: string
      items: (Item & { system: EquipmentDataModel<EquipmentSchema> })[]
    }[] = []
    const containers = hero.containers?.() ?? []

    for (const stack of stackables) {
      const container = containers.find((c: any) =>
        c.itemIds.includes(stack.id),
      )
      const stackId = recombineSplits
        ? `${stack.type}|${stack.name}|${container?.parent?.id ?? ""}`
        : (stack.flags[sys_id]?.["item-stack-id"] ?? stack.name)
      const existing = stackGroups.find((g) => g.id === stackId)
      if (existing) {
        existing.items.push(stack)
      }
      else {
        stackGroups.push({ id: stackId, items: [stack] })
      }
    }

    for (const group of stackGroups) {
      if (group.items.length > 1) {
        await group.items[0].update({
          "system.bulk.quantity": group.items.reduce((sum, it) => {
            return sum + it.system.bulk.quantity
          }, 0),
        } as Record<string, number>)
        await deleteItems(
          hero,
          group.items?.slice(1)?.map((it) => it._id!),
        )
      }
    }
  }
}

export const useItem = async (
  actor: Actor & { system: HeroDataModel },
  item: Item & { system: AlchemicalItemDataModel | SundryDataModel },
  skipDeletion?: boolean,
  e?: any,
) => {
  const sendToChat = () => {
    sendVagabondChatCard(actor, "ItemChatCard", {
      actorId: getId(actor),
      itemId: getId(item),
      itemName: getName(item),
      isConsumable: item.system.isConsumable,
    })
  }

  if (item) {
    if (item.system instanceof AlchemicalItemDataModel) {
      if (!skipDeletion) await deleteItems(actor, [getId(item)])

      if (
        item.system.damage.dice.count > 0 ||
        item.system.appliedEffects.length > 0
      ) {
        const attack = HeroAttack.buildAlchemyAttack(
          actor,
          item as Item & { system: AlchemicalItemDataModel },
        )
        attack.initiate(e, { requireFocusUpkeep: true })
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
    ui.notifications?.warn(appLang.Notifications.itemNotFound)
  }
}

export const sendItemToChat = (
  hero: any,
  item: EquipmentDataModel<EquipmentSchema>,
) => {
  sendVagabondChatCard(hero, "ItemChatCard", {
    actorId: getId(hero),
    itemId: getId(item),
    itemName: getName(item),
  })
}

export const equippedItemContextMenu = (
  hero: any,
  item: ArmorDataModel | WeaponDataModel | SundryDataModel,
): CtxMenuItem[] => {
  const menuItems: CtxMenuItem[] = []

  if (item instanceof WeaponDataModel) {
    menuItems.push({
      icon: Sword,
      label: appLang.ButtonActions.attack,
      action: (e) => {
        HeroAttack.buildWeaponAttack(hero.parent, item.parent).initiate(e, {
          requireFocusUpkeep: true,
        })
      },
    })
    if (item.grip.style === "V") {
      menuItems.push({
        icon: HandFist,
        label: appLang.HeroSheet.Inventory.ctxGrip,
        action: () => hero.toggleVersatileGrip(item.parent),
      })
    }
  }

  menuItems.push({
    icon: Hand,
    label: appLang.ButtonActions.unequip,
    action: () => hero.equip(item.parent),
  })

  const lightOption = LightSourceUtil.contextMenuOption(item)
  if (lightOption) menuItems.unshift(lightOption)

  if (game.user?.isActiveGM && item.isCursed()) {
    menuItems.push(removeCursesContextOption(item))
  }

  return menuItems
}

export const equipmentContextMenuItems = (
  hero: HeroDataModel,
  item: EquipmentDataModel<EquipmentSchema>,
): CtxMenuItem[] => {
  const menuItems: CtxMenuItem[] = []

  if (item instanceof WeaponDataModel && item.properties.includes("thrown")) {
    menuItems.push({
      icon: Sword,
      label: appLang.ButtonActions.throw,
      action: (e) => {
        HeroAttack.buildWeaponAttack(hero.parent, item.parent).initiate(e, {
          requireFocusUpkeep: true,
        })
      },
    })
  }

  if (item.isEquippable) {
    if (item.isEquipped) {
      if (item instanceof WeaponDataModel && item.grip.style === "V") {
        menuItems.push({
          icon: HandFist,
          label: appLang.HeroSheet.Inventory.ctxGrip,
          action: () => hero.toggleVersatileGrip(item.parent),
        })
      }
      menuItems.push({
        icon: Hand,
        label: appLang.HeroSheet.Inventory.ctxUnequip,
        action: () => hero.equip(item.parent),
      })
    }
    else {
      menuItems.push({
        icon: HandFist,
        label: appLang.HeroSheet.Inventory.ctxEquip,
        action: async () => await hero.equip(item.parent),
      })
    }
  }
  else if (item.isConsumable) {
    menuItems.push(useItemContextOption(hero.parent, item.parent))
  }

  const lightOption = LightSourceUtil.contextMenuOption(item)
  if (lightOption) menuItems.push(lightOption)

  if (item.isBoundRelic()) {
    menuItems.push(bindItemContextOption(item))
  }

  if (game.user?.isActiveGM && item.isCursed()) {
    menuItems.push(removeCursesContextOption(item))
  }

  menuItems.push(
    viewItemSheetContextOption(item),
    sendItemToChatContextOption(hero, item),
  )

  if (item.bulk.isStackable && item.bulk.quantity > 1) {
    menuItems.push(splitItemsContextOption(hero, item))
  }

  const hideDelete = item.isBoundToHero()

  if (!hideDelete) {
    menuItems.push(deleteItemContextOption(hero, item))
  }

  if (!hideDelete && item.bulk.isStackable && item.bulk.quantity > 1) {
    menuItems.push(deleteAllItemsContextOption(hero, item))
  }

  return menuItems
}

export const containerItemContextMenuItems = (
  actor: ActorDataModel<BaseActorSchema> | null,
  item: EquipmentDataModel<EquipmentSchema>,
  container: ContainerDataModel,
): CtxMenuItem[] => {
  const menuItems: CtxMenuItem[] = []
  if (item.isConsumable && actor?.parent?.type === "hero") {
    menuItems.push(useItemContextOption(actor.parent, item.parent))
  }
  menuItems.push(viewItemSheetContextOption(item))
  menuItems.push({
    icon: Undo,
    label: appLang.HeroSheet.Inventory.ctxExtract,
    action: () => extractItemFromContainer(container, item.parent),
  })
  if (!item.isBoundToHero()) {
    menuItems.push(deleteItemContextOption(actor, item))
    if (item.bulk.isStackable && item.bulk.quantity > 1) {
      menuItems.push(deleteAllItemsContextOption(actor, item))
    }
  }
  return menuItems
}

const useItemContextOption = (
  hero: Actor & { system: HeroDataModel },
  item: Item & { system: AlchemicalItemDataModel | SundryDataModel },
) => {
  return {
    icon: Hand,
    label: appLang.HeroSheet.Inventory.ctxUse,
    action: () => useItem(hero, item),
  }
}

const removeCursesContextOption = (
  item: EquipmentDataModel<EquipmentSchema>,
) => {
  return {
    icon: Eraser,
    label: appLang.HeroSheet.Inventory.ctxRemoveCurses,
    action: async () => {
      const curses = item.relicPowers.filter(
        (rel) => rel.category.value === "cursed",
      )
      for (const curse of curses) {
        await RelicPowerProcessor.toggleRelicEffect(
          item.parent as any,
          curse as any,
        )
      }
      const message = localizeString(appLang.Notifications.cursesLifted, {
        itemName: item.parent.name,
      })
      const owner = item.parent.parent as any
      const userIds = (
        game.users?.filter(
          (user) => !user.isGM && owner?.testUserPermission?.(user, "OWNER"),
        ) ?? []
      ).map((user) => user.id)
      if (userIds.length > 0) {
        game.socket?.emit(`system.${sys_id}`, {
          action: "notifyCursesLifted",
          data: { message, userIds },
        })
      }
    },
  }
}

const bindItemContextOption = (item: EquipmentDataModel<EquipmentSchema>) => {
  return {
    icon: Link,
    label: item.isBound
      ? appLang.HeroSheet.Inventory.ctxUnbind
      : appLang.HeroSheet.Inventory.ctxBind,
    action: () => item.toggleBound(),
  }
}

const viewItemSheetContextOption = (
  item: EquipmentDataModel<EquipmentSchema>,
) => {
  return {
    icon: Eye,
    label: appLang.HeroSheet.Inventory.ctxView,
    action: () => openItemSheet(item),
  }
}

const sendItemToChatContextOption = (
  hero: any,
  item: EquipmentDataModel<EquipmentSchema>,
) => {
  return {
    icon: MessageSquareText,
    label: appLang.HeroSheet.Inventory.ctxChat,
    action: () => sendItemToChat(hero, item),
  }
}

const splitItemsContextOption = (
  hero: any,
  item: EquipmentDataModel<EquipmentSchema>,
) => {
  return {
    icon: Split,
    label: appLang.HeroSheet.Inventory.ctxSplit,
    action: () =>
      new ItemStackSplitApp(hero.parent, item.parent).render({ force: true }),
  }
}

/** Items with non-curse relic powers are likely unique, so confirm before deleting them. */
const confirmDeleteItem = async (
  item: EquipmentDataModel<EquipmentSchema>,
): Promise<boolean> => {
  const isUnique = item.relicPowers?.some(
    (rel) => rel.category.value !== "cursed",
  )
  if (!isUnique) return true
  const strings = appLang.HeroSheet.Inventory
  return showConfirmationDialog({
    title: localizeString(strings.deleteUniqueTitle, {
      name: item.parent.name,
    }),
    description: strings.deleteUniqueMessage,
    confirmText: strings.deleteUniqueConfirm,
    cancelText: strings.deleteUniqueCancel,
    variant: "destructive",
  })
}

const deleteItemContextOption = (
  actor: ActorDataModel<BaseActorSchema> | null,
  item: EquipmentDataModel<EquipmentSchema>,
) => {
  return {
    icon: Trash,
    label: appLang.HeroSheet.Inventory.ctxDelete,
    action: async () => {
      if (await confirmDeleteItem(item)) deleteItems(actor, [getId(item)])
    },
    isDestructive: true,
  }
}

const deleteAllItemsContextOption = (
  actor: ActorDataModel<BaseActorSchema> | null,
  item: EquipmentDataModel<EquipmentSchema>,
) => {
  return {
    icon: Trash,
    label: appLang.HeroSheet.Inventory.ctxDeleteAll,
    action: async () => {
      if (!(await confirmDeleteItem(item))) return
      await item.parent.update({
        "system.bulk.isStackable": false,
        "system.bulk.quantity": 0,
      })
      deleteItems(actor, [getId(item)])
    },
    isDestructive: true,
  }
}

export const deleteItems = async (actor: any, itemIds: string[]) => {
  if (!actor) return

  if (actor.parent) {
    return await actor.parent.deleteEmbeddedDocuments("Item", itemIds, {
      deleteVagabondStack: false,
    })
  }
  else {
    return await actor.deleteEmbeddedDocuments("Item", itemIds, {
      deleteVagabondStack: false,
    })
  }
}

export const deleteItemStack = async (actor: any, itemIds: string[]) => {
  if (!actor) return

  if (actor.parent) {
    await actor.parent.deleteEmbeddedDocuments("Item", itemIds, {
      deleteVagabondStack: true,
    })
  }
  else {
    await actor.deleteEmbeddedDocuments("Item", itemIds, {
      deleteVagabondStack: true,
    })
  }
}

/**
 * Updates the given items' sort properties according to user preference.
 * Places items into containers.
 */
export const inventoryItemDragDropHandler = async (
  actor: ActorDataModel<BaseActorSchema> | null,
  dragItem: EquipmentDataModel<EquipmentSchema>,
  targetItem: EquipmentDataModel<EquipmentSchema>,
  siblings: EquipmentDataModel<EquipmentSchema>[],
) => {
  if (!actor || !dragItem || !targetItem) return

  if (
    targetItem.parent.type === "container" &&
    dragItem.parent.type !== "container" &&
    !dragItem.isEquipped
  ) {
    addItemToContainer(targetItem as ContainerDataModel, dragItem.parent)
  }
  else {
    if (
      dragItem.bulk.isStackable &&
      targetItem.bulk.isStackable &&
      dragItem.parent.name === targetItem.parent.name &&
      dragItem.parent.id !== targetItem.parent.id
    ) {
      await targetItem.parent.update({
        "system.bulk.quantity":
          targetItem.bulk.quantity + dragItem.bulk.quantity,
      })
      await deleteItemStack(actor, [dragItem.parent.id])
      return
    }

    if (dragItem.parent.id === targetItem.parent.id) return

    const ordered = siblings
      .map((it) => it.parent)
      .filter((it) => it.id !== dragItem.parent.id)
    const targetIndex = ordered.findIndex(
      (it) => it.id === targetItem.parent.id,
    )
    if (targetIndex < 0) return

    const dragIndex = siblings.findIndex(
      (it) => it.parent.id === dragItem.parent.id,
    )
    const targetOriginalIndex = siblings.findIndex(
      (it) => it.parent.id === targetItem.parent.id,
    )
    const movingDown = dragIndex >= 0 && dragIndex < targetOriginalIndex
    ordered.splice(
      movingDown ? targetIndex + 1 : targetIndex,
      0,
      dragItem.parent,
    )

    const sortingUpdate = ordered
      .map((it, index) => ({
        _id: it.id,
        sort: (index + 1) * 1000,
        current: it.sort,
      }))
      .filter((it) => it.sort !== it.current)
      .map(({ _id, sort }) => ({ _id, sort }))

    if (sortingUpdate.length) {
      await actor.parent?.updateEmbeddedDocuments("Item", sortingUpdate)
    }
  }
}

export const subtractCoinsFromHero = (hero: HeroDataModel, coins: Coins) => {
  const newCoins = subtractCoins(hero.inventory.coins, coins)
  return hero.parent.update({ system: { inventory: { coins: newCoins } } })
}

export const getAlchemyMaterials = (
  actor: Actor & { system: HeroDataModel },
): (Item & { system: SundryDataModel })[] => {
  return actor.items.filter(
    (it) => it.system instanceof SundryDataModel && it.system.isMaterials,
  ) as (Item & { system: SundryDataModel })[]
}

export const hasAlchemyToolsEquipped = (hero: HeroDataModel): boolean => {
  return hero.inventory.items.some(
    (it) => it instanceof SundryDataModel && it.isAlchemyTools && it.isEquipped,
  )
}

export const removeStackableItemFromHero = (
  actor: HeroDataModel,
  stackableItem: any,
) => {
  if (stackableItem.system.bulk.quantity > 1) {
    return stackableItem.update({
      "system.bulk.quantity": stackableItem.system.bulk.quantity - 1,
    })
  }
  else {
    return deleteItems(actor, [stackableItem.id])
  }
}
