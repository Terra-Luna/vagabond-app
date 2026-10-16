import { VagabondActorSheet } from "../VagabondActorSheet"
import { ItemActorSheetComponent } from "./component/ItemActorSheetComponent"

// @ts-expect-error excluded positionals
export class ItemActorSheet extends VagabondActorSheet {
    Component = ItemActorSheetComponent
    static DEFAULT_OPTIONS = {
        position: {
            width: 200,
            height: "auto"
        },
        window: {
            resizable: false
        },
        dragDrop: [
            {
                dragSelector: ".draggable",
                dropSelector: ".sheet-body"
            }
        ]
    }
}