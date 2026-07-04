import { VgLiteActorSheet } from "../VgLiteActorSheet"
import { HeroSheetReactComponent } from "./HeroSheetComponent"

export default class HeroSheet extends VgLiteActorSheet {
    Component = HeroSheetReactComponent
    static DEFAULT_OPTIONS = {
        position: {
            width: 420,
            height: 900
        },
        window: {
            resizable: true
        }
    }

    async _onDropItem(event: DragEvent, data: Record<string, any>) {
        const result = await super._onDropItem(event, data)
        console.log(event, data)
    }
}