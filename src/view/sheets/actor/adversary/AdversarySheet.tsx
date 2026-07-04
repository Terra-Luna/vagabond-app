import { VgLiteActorSheet } from "../VgLiteActorSheet"
import { AdversarySheetReactComponent } from "./component/AdversarySheetComponent"

export default class AdversarySheet extends VgLiteActorSheet {
    Component = AdversarySheetReactComponent
    static DEFAULT_OPTIONS = {
        position: {
            width: 400,
            height: 700
        },
        window: {
            resizable: true
        },
        dragDrop: []
    }
}