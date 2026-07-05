import { VgLiteActorSheet } from "../VgLiteActorSheet"
import { HeroSheetReactComponent } from "./HeroSheetComponent"

export class HeroSheet extends VgLiteActorSheet {
    Component = HeroSheetReactComponent
    static DEFAULT_OPTIONS = {
        position: {
            width: 420,
            height: 900
        },
        window: {
            resizable: true
        }
    }

}