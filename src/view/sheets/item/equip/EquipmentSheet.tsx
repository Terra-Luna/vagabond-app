import { VagabondItemSheet } from "../VagabondItemSheet"
import { EquipmentSheetComponent } from "./EquipmentSheetComponent"

export class EquipmentSheet extends VagabondItemSheet {
    Component = EquipmentSheetComponent
    static DEFAULT_OPTIONS = {
        position: {
            width: 380,
            height: "auto"
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