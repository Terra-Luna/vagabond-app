const { sheets } = foundry.applications
import { VgLiteSheetMixin } from "../VgLiteSheet"

export abstract class VgLiteItemSheet extends VgLiteSheetMixin(sheets.ItemSheetV2) {
    getReactProps() { return { ...super.getReactProps(), item: this.item } }
    abstract Component: React.ComponentType<any>
}