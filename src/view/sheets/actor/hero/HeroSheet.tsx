import { VagabondActorSheet } from "../VagabondActorSheet"
import { HeroSheetReactComponent } from "./HeroSheetComponent"

export class HeroSheet extends VagabondActorSheet {
    Component = HeroSheetReactComponent
    static DEFAULT_OPTIONS = {
        position: {
            width: 416,
            height: "auto",
            top: 0,
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
         * DO NOT ALLOW drag/drop of Spells and Perks directly onto the Hero
         * sheet. Use the rules engine's choices selectors instead.
         */
        if (item && ['feature', 'spell', 'perk'].includes(item.type)) {
            ui.notifications?.warn('Features, Spells, and Perks cannot be dropped here. Please add Features to a Class and select Spells or Perks through the rules selectors.')
            return false
        }

        return super._onDrop(event)
    }

}