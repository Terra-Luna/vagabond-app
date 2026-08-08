import { VgLiteItemSheet } from "../../VgLiteItemSheet";
import { AncestryReactComponent } from "./AncestrySheetComponent";

export class AncestrySheet extends VgLiteItemSheet {
    static DEFAULT_OPTIONS = {
        position: {
            width: 800,
            height: 512 as any,
            top: 100,
            left: 100
        },
        window: {
            resizable: false
        },
        dragDrop: []
    }
    Component = AncestryReactComponent
}