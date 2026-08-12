import { VagabondItemSheet } from "../../VagabondItemSheet"
import { ClassSheetComponent } from "./ClassSheetComponent"

export class ClassSheet extends VagabondItemSheet {
    Component = ClassSheetComponent
    static DEFAULT_OPTIONS = {
        position: {
            width: 1380,
            height: 720 as any,
            top: 100,
            left: 100
        },
        window: {
            resizable: true
        },
        dragDrop: []
    }

    async close(options = {}) {
        const result = await super.close(options)

        const defaults = ClassSheet.DEFAULT_OPTIONS.position
        this.position.width = defaults.width
        this.position.height = defaults.height

        return result
    }
}