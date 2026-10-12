import { VagabondItemSheet } from "../VagabondItemSheet"
import { EquipmentSheetComponent } from "./EquipmentSheetComponent"

// @ts-expect-error -- intentionally excluding top and left from DEFAULT_OPTIONS
export class EquipmentSheet extends VagabondItemSheet {
    Component = EquipmentSheetComponent
    static DEFAULT_OPTIONS = {
        position: {
            width: 360,
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