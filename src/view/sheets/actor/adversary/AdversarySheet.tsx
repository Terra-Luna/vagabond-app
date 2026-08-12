import { VagabondActorSheet } from "../VagabondActorSheet"
import { AdversarySheetReactComponent } from "./component/AdversarySheetComponent"

export class AdversarySheet extends VagabondActorSheet {
    Component = AdversarySheetReactComponent
    static DEFAULT_OPTIONS = {
        position: {
            width: 400,
            height: "auto"
        },
        window: {
            resizable: true
        },
        dragDrop: []
    }
}