import { VgLiteItemSheet } from "../../VgLiteItemSheet";
import { AncestryReactComponent } from "./AncestrySheetComponent";

export class AncestrySheet extends VgLiteItemSheet {
    static DEFAULT_OPTIONS = {
        position: {
            width: 420,
            height: 500
        },
        window: {
            resizable: true
        },
        dragDrop: []
    }
    Component = AncestryReactComponent
}