const { api, sheets } = foundry.applications
import ItemDataModel, { BaseItemSchema } from "../../../model/item/ItemDataModel"
import { VgLiteSheetMixin } from "../VgLiteSheet";

export interface FoundryItem<T extends ItemDataModel<BaseItemSchema>> {
    update: (data: Record<keyof T, any>) => any
    system: T
}

export abstract class VgLiteItemSheet extends VgLiteSheetMixin(sheets.ItemSheetV2) {
    getReactProps() {
        return {
            item: this.item
        }
    }

}

export const ItemSheetHeader = ({ item }: { item: ItemDataModel<BaseItemSchema> }) => {
    return <div className="vglite-item-sheet-header">
        {item.parent.name}
        {item.description}
    </div>
}