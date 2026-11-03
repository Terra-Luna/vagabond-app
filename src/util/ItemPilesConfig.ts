import { sys_id } from "./foundry-util"

export class ItemPilesConfig {

  static configure = () => {
    const api = (game as any).itempiles?.API
    if (!api) return

    const config = {
      system: sys_id,
      VERSION: "1.0.0",

      ACTOR_CLASS_TYPE: "itemActor",
      ITEM_QUANTITY_ATTRIBUTE: "system.bulk.quantity",
      ITEM_PRICE_ATTRIBUTE: "system.copperValue",

      ITEM_CLASS_LOOT_TYPE: "sundry",
      ITEM_CLASS_WEAPON_TYPE: "weapon",
      ITEM_CLASS_EQUIPMENT_TYPE: "armor",

      itemTypes: ["alchemical", "weapon", "armor", "sundry"],

      ITEM_FILTERS: [
        { path: "type", filters: "class" },
        { path: "type", filters: "ancestry" },
        { path: "type", filters: "perk" },
        { path: "type", filters: "spell" },
        { path: "type", filters: "startingpack" },
      ],

      UNSTACKABLE_ITEM_TYPES: ["weapon", "armor", "startingpack"],

      ITEM_SIMILARITIES: ["name", "type"],

      PILE_DEFAULTS: {
        type: "pile",
        displayOne: true,
        showItemName: false,
        overrideSingleItemScale: false,
        singleItemScale: 0.5,
        shareItemsEnabled: false,
        shareCurrenciesEnabled: false,
        takeAllEnabled: false,
        splitAllEnabled: true,
        activePlayers: true,
      },

      TOKEN_FLAG_DEFAULTS: {
        width: 1,
        height: 1,
        depth: 1,
        displayName: 0,
        "texture.scaleX": 0.5,
        "texture.scaleY": 0.5,
      },

      ITEM_TRANSFORMER: async (itemData: any) => {
        if (
          itemData?.system?.bulk &&
          (!itemData.system.bulk.isStackable ||
            itemData.system.lightSourceData?.isLightSource)
        ) {
          foundry.utils.setProperty(
            itemData,
            "flags.item-piles.item.canStack",
            "no",
          )
        }
        return itemData
      },

      CURRENCIES: [
        {
          type: "attribute",
          name: "Gold",
          img: "/icons/commodities/currency/coin-plain-gold.webp",
          abbreviation: "{#}G",
          primary: false,
          exchangeRate: 10000,
          data: { path: "system.inventory.coins.g" },
        },
        {
          type: "attribute",
          name: "Silver",
          img: "/icons/commodities/currency/coin-engraved-moon-silver.webp",
          abbreviation: "{#}S",
          primary: false,
          exchangeRate: 100,
          data: { path: "system.inventory.coins.s" },
        },
        {
          type: "attribute",
          name: "Copper",
          img: "/icons/commodities/currency/coin-oval-rune-copper.webp",
          abbreviation: "{#}C",
          primary: true,
          exchangeRate: 1,
          data: { path: "system.inventory.coins.c" },
        },
      ],

      FLAGS: {
        CUSTOM_CATEGORY: "flags.item-piles.system.category",
        ITEM_PRICE_MODIFIER: "flags.item-piles.system.priceModifier",
        CUSTOM_PRICES: "flags.item-piles.system.prices",
      },
    }

    api.addSystemIntegration(config)
    ItemPilesConfig.registerHooks()
  }

  private static isUnstackable(item: any): boolean {
    return (
      !item?.system?.bulk?.isStackable ||
      !!item.system.lightSourceData?.isLightSource
    )
  }

  /**
   * When Item Piles creates the Default Item Pile it hard-codes single item scale 0.75, "Use Item Name",
   * and the scale override on top of our PILE_DEFAULTS. Undo those right after it writes them, on both
   * the actor and its prototype token.
   */
  private static async fixDefaultPile(actor: any) {
    if (!game.user?.isActiveGM || actor?.name !== "Default Item Pile") return
    const isHardcoded = (data: any) =>
      data?.enabled &&
      data.overrideSingleItemScale &&
      data.singleItemScale === 0.75
    const actorData = actor.getFlag("item-piles", "data")
    const tokenData = actor.prototypeToken?.getFlag?.("item-piles", "data")
    if (!isHardcoded(actorData) && !isHardcoded(tokenData)) return

    const fixed = {
      overrideSingleItemScale: false,
      singleItemScale: 0.5,
      showItemName: false,
    }
    await actor.update({
      "flags.item-piles.data": fixed,
      "prototypeToken.flags.item-piles.data": fixed,
    } as any)
  }

  private static registerHooks() {
    Hooks.on("createActor", (actor: any) =>
      ItemPilesConfig.fixDefaultPile(actor),
    )
    Hooks.on("updateActor", (actor: any) =>
      ItemPilesConfig.fixDefaultPile(actor),
    )
    for (const actor of game.actors?.contents ?? [])
      ItemPilesConfig.fixDefaultPile(actor)

    /**
     * Players can't delete pile tokens themselves, so route the deletion of an emptied pile
     * through the GM instead of letting Foundry raise a permission error.
     */
    Hooks.on("item-piles-preDeleteItemPile" as any, (target: any) => {
      const doc = target?.document ?? target
      if (!doc?.uuid || doc.canUserModify?.(game.user, "delete")) return
      game.socket?.emit(`system.${sys_id}`, {
        action: "deleteEmptyItemPile",
        user: game.user?.id,
        data: { tokenUuid: doc.uuid },
      })
      return false
    })
    const refreshPileImage = (item: any, _options?: any, userId?: string) => {
      const actor = item?.parent
      if (!game.user?.isActiveGM || !actor?.getActiveTokens) return
      setTimeout(() => {
        const items = actor.items.contents.filter(
          (i: any) => !i.getFlag?.("item-piles", "item")?.isContained,
        )
        const img = items[0]?.img
        if (!img) return
        for (const token of actor.getActiveTokens(false, true) as any[]) {
          const data = token.getFlag("item-piles", "data")
          if (
            !data?.enabled ||
            data.type !== "pile" ||
            !data.displayOne ||
            token.texture.src === img
          )
            continue
          token.update({ "texture.src": img })
        }
      }, 300)
    }
    Hooks.on("createItem", refreshPileImage)
    Hooks.on("deleteItem", refreshPileImage)

    Hooks.on(
      "item-piles-preTransferItems" as any,
      (
        _sourceActor: any,
        sourceUpdates: any,
        targetActor: any,
        targetUpdates: any,
      ) => {
        const updates: any[] = targetUpdates.itemsToUpdate ?? []
        for (let i = updates.length - 1; i >= 0; i--) {
          const existing = targetActor.items.get(updates[i]._id)
          if (!existing || !ItemPilesConfig.isUnstackable(existing)) continue

          const deltaIndex = targetUpdates.itemDeltas.findIndex(
            (d: any) => d.item?._id === existing.id,
          )
          const incoming = sourceUpdates.itemDeltas.find(
            (d: any) =>
              d.item?.name === existing.name && d.item?.type === existing.type,
          )
          if (!incoming) continue

          updates.splice(i, 1)
          if (deltaIndex > -1) targetUpdates.itemDeltas.splice(deltaIndex, 1)

          const copy = foundry.utils.deepClone(incoming.item)
          delete copy._id
          foundry.utils.setProperty(copy, "system.bulk.quantity", 1)
          foundry.utils.setProperty(
            copy,
            "flags.item-piles.item.canStack",
            "no",
          )
          targetUpdates.itemsToCreate.push(copy)
        }
      },
    )
  }

}
