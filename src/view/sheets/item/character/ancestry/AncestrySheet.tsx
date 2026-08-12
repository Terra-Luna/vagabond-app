import { VagabondItemSheet } from "../../VagabondItemSheet";
import { AncestryReactComponent } from "./AncestrySheetComponent";

export class AncestrySheet extends VagabondItemSheet {
    static DEFAULT_OPTIONS = {
        position: {
            width: 800,
            height: "auto",
            top: 100,
            left: 100
        },
        window: {
            resizable: true
        },
        dragDrop: []
    }
    Component = AncestryReactComponent
}