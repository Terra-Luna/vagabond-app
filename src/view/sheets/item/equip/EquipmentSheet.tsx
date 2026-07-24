import { VgLiteItemSheet } from "../VgLiteItemSheet"
import { EquipmentSheetComponent } from "./EquipmentSheetComponent"

export class EquipmentSheet extends VgLiteItemSheet {
    Component = EquipmentSheetComponent
    static DEFAULT_OPTIONS = {
        position: {
            width: 380,
            height: 540
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