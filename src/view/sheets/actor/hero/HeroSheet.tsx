import { appLang } from "../../../../util/lang"
import { VagabondActorSheet } from "../VagabondActorSheet"
import { HeroSheetComponent } from "./HeroSheetComponent"

export class HeroSheet extends VagabondActorSheet {
  Component = HeroSheetComponent
  static DEFAULT_OPTIONS = {
    position: {
      width: 360,
      height: 815 as any,
      top: 80,
      left: 160,
    },
    window: {
      resizable: true,
    },
    dragDrop: [],
  }

  override async _onDrop(event: DragEvent): Promise<any> {
    const data = foundry.applications.ux.TextEditor.getDragEventData(event)

    if ((data as any)?.type !== "Item") return super._onDrop(event)

    const item = await (Item.implementation as any).fromDropData(data)

    /**
     * DO NOT ALLOW drag/drop of Features, Spells, & Perks directly onto the Hero
     * sheet. Instead, these items should be granted through rules configurations.
     */
    if (item && ["feature", "spell", "perk"].includes(item.type)) {
      ui.notifications?.warn(appLang.Notifications.heroDropNotAllowed)
      return false
    }

    /**
     * Items dragged out of an item pile must be transferred (not copied) so it gets removed from the pile.
     * Item Piles performs the removal as a GM, since players can't edit the pile's actor.
     */
    const source = item?.parent
    const pileData = source?.getFlag?.("item-piles", "data")
    if (
      source &&
      pileData?.enabled &&
      pileData.type === "pile" &&
      source.id !== this.actor.id &&
      this.actor.isOwner
    ) {
      await (game as any).itempiles?.API?.transferItems(source, this.actor, [
        item.id,
      ])
      return true
    }

    /**
     * Await the creation of the item to ensure it's done being added to the actor before continuing.
     * This prevents issues with stale drag event data and odd behaviour such as dropping an inventory
     * item onto the sheet only for it not to appear.
     */
    if (item && !(data as any).id && this.actor.isOwner) {
      await this.actor.createEmbeddedDocuments("Item", [item.toObject()])
      return true
    }

    return super._onDrop(event)
  }
}
