import { VagabondActorSheet } from "../VagabondActorSheet"
import { AdversarySheetReactComponent } from "./component/AdversarySheetComponent"

export class AdversarySheet extends VagabondActorSheet {
    Component = AdversarySheetReactComponent
    static DEFAULT_OPTIONS = {
        position: {
            width: 420,
            height: "auto",
            top: 120,
            left: 500
        },
        window: {
            resizable: true
        },
        dragDrop: [
            {
                dragSelector: ".draggable",
                dropSelector: ".sheet-body"
            }
        ]
    }
}