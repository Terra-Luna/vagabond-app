import { VagabondActorSheet } from "../VagabondActorSheet"
import { NpcSheetComponent } from "./component/NpcSheetComponent"

export class NpcSheet extends VagabondActorSheet {
    Component = NpcSheetComponent
    static DEFAULT_OPTIONS = {
        position: {
            width: 380,
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