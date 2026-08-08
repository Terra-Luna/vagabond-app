import { VgLiteItemSheet } from "../../VgLiteItemSheet"
import { ClassSheetComponent } from "./ClassSheetComponent"

export class ClassSheet extends VgLiteItemSheet {
    Component = ClassSheetComponent
    static DEFAULT_OPTIONS = {
        position: {
            width: 420,
            height: "auto",
            top: 100,
            left: 100
        },
        window: {
            resizable: true
        },
        dragDrop: []
    }
}