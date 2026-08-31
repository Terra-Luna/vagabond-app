import { VagabondActorSheet } from "../VagabondActorSheet"
import { ItemActorSheetComponent } from "./component/ItemActorSheetComponent"

export class ItemActorSheet extends VagabondActorSheet {
    Component = ItemActorSheetComponent
    static DEFAULT_OPTIONS = {
        position: {
            width: 200,
            height: "auto",
            top: 120,
            left: 120
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