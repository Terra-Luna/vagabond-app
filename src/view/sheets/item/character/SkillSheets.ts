import { VgLiteItemSheet } from "../VgLiteItemSheet"
import { PerkSheetReactComponent } from "./skills/PerkSheetReactComponent"
import { SpellSheetReactComponent } from "./skills/SpellSheetReactComponent"

export class PerkSheet extends VgLiteItemSheet {
    Component = PerkSheetReactComponent
    static DEFAULT_OPTIONS = {
        position: {
            width: 380,
            height: "auto"
        },
        window: {
            resizable: true
        },
        dragDrop: []
    }
}

export class SpellSheet extends VgLiteItemSheet {
    Component = SpellSheetReactComponent
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