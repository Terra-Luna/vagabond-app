const { sheets } = foundry.applications
import ItemDataModel, { BaseItemSchema } from "../../../model/item/ItemDataModel"
import { VgLiteSheetMixin } from "../VgLiteSheet";

export interface FoundryItem<T extends ItemDataModel<BaseItemSchema>> {
    _id: string
    img: string
    name: string
    type: string
    update: (data: Record<keyof T, any>) => any
    system: T
}

export abstract class VgLiteItemSheet extends VgLiteSheetMixin(sheets.ItemSheetV2) {
    getReactProps() { return { ...super.getReactProps(), item: this.item } }
    abstract Component: React.ComponentType<any>;
}

export const ItemSheetHeader = ({ item }: { item: ItemDataModel<BaseItemSchema> }) => {
    return <div className="">
        {item.parent.name}
        {item.description}
    </div>
}