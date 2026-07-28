import { VgLiteItemSheet } from "../../VgLiteItemSheet"
import { ClassSheetReactComponent } from "./ClassSheetReactComponent"

export class ClassSheet extends VgLiteItemSheet {
    Component = ClassSheetReactComponent
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