import { VagabondActorSheet } from "../VagabondActorSheet"
import { HeroSheetReactComponent } from "./HeroSheetComponent"

export class HeroSheet extends VagabondActorSheet {
    Component = HeroSheetReactComponent
    static DEFAULT_OPTIONS = {
        position: {
            width: 416,
            height: "auto",
            top: 60,
            left: 333
        },
        window: {
            resizable: true
        },
        dragDrop: []
    }

    override async _onDrop(event: DragEvent): Promise<any> {
        const data = foundry.applications.ux.TextEditor.getDragEventData(event)

        if ((data as any)?.type !== "Item") return super._onDrop(event)

        const item = await (Item.implementation as any).fromDropData(data)

        /**
         * DO NOT ALLOW drag/drop of Features, Spells, & Perks directly onto the Hero
         * sheet. Instead, these items should be granted through rules configurations.
         */
        if (item && ['feature', 'spell', 'perk'].includes(item.type)) {
            ui.notifications?.warn('Features, Spells, and Perks cannot be dropped here. Please add Features to a Class and select Spells or Perks through the rules selectors.')
            return false
        }

        /**
         * Await the creation of the item to ensure it is done being added to the actor before continuing.
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