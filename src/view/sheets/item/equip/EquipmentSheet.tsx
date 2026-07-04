import { VgLiteItemSheet } from "../VgLiteItemSheet"
import { EquipmentSheetReactComponent } from "./EquipmentSheetComponent"

export class EquipmentSheet extends VgLiteItemSheet {
    Component = EquipmentSheetReactComponent
    static DEFAULT_OPTIONS = {
        position: {
            width: 420,
            height: 500
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