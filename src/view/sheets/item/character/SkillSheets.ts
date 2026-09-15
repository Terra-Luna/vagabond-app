import { VagabondItemSheet } from "../VagabondItemSheet"
import { FeatureSheetComponent } from "./skills/FeatureSheetComponent"
import { PerkSheetComponent } from "./skills/PerkSheetComponent"
import { SpellSheetComponent } from "./skills/SpellSheetComponent"

export class FeatureSheet extends VagabondItemSheet {
    Component = FeatureSheetComponent
    static DEFAULT_OPTIONS = {
        position: {
            width: 440,
            height: "auto",
            top: 200,
            left: 400
        },
        window: {
            resizable: true
        },
        dragDrop: []
    }
}

export class PerkSheet extends VagabondItemSheet {
    Component = PerkSheetComponent
    static DEFAULT_OPTIONS = {
        position: {
            width: 380,
            height: "auto",
            top: 200,
            left: 400
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
            height: "auto",
            top: 200,
            left: 400
        },
        window: {
            resizable: true
        },
        dragDrop: []
    }
}