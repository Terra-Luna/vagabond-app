import { VgLiteItemSheet } from "../../VgLiteItemSheet"
import { ClassSheetComponent } from "./ClassSheetComponent"

export class ClassSheet extends VgLiteItemSheet {
    Component = ClassSheetComponent
    static DEFAULT_OPTIONS = {
        position: {
            width: 420,
            height: "auto"
        },
        window: {
            resizable: true
        },
        dragDrop: []
    }
}