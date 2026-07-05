import { VgLiteItemSheet } from "../VgLiteItemSheet"
import { EquipmentSheetReactComponent } from "./EquipmentSheetComponent"

export class EquipmentSheet extends VgLiteItemSheet {
    Component = EquipmentSheetReactComponent
    static DEFAULT_OPTIONS = {
        position: {
            width: 380,
            height: 420
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