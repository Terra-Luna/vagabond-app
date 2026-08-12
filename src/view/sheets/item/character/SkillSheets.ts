import { VagabondItemSheet } from "../VagabondItemSheet"
import { PerkSheetComponent } from "./skills/PerkSheetComponent"
import { SpellSheetComponent } from "./skills/SpellSheetComponent"

export class PerkSheet extends VagabondItemSheet {
    Component = PerkSheetComponent
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

export class SpellSheet extends VagabondItemSheet {
    Component = SpellSheetComponent
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