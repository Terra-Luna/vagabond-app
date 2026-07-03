import { VgLiteItemSheet } from "../VgLiteItemSheet"
import { ClassReactComponent } from "./ClassSheet"
import { PerkReactComponent } from "./PerkSheet"
import { SpellReactComponent } from "./SpellSheet"

export class PerkSheet extends VgLiteItemSheet {
    Component = PerkReactComponent
}

export class ClassSheet extends VgLiteItemSheet {
    Component = ClassReactComponent
}

export class SpellSheet extends VgLiteItemSheet {
    Component = SpellReactComponent
}
