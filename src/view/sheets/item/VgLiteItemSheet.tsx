const { sheets } = foundry.applications
import { JSONValue } from "@league-of-foundry-developers/foundry-vtt-types/utils"
import ContainerDataModel, { addItemToContainer } from "../../../model/item/equip/ContainerDataModel"
import { VgLiteSheetMixin } from "../VgLiteSheet"

export abstract class VgLiteItemSheet extends VgLiteSheetMixin(sheets.ItemSheetV2) {
    getReactProps() { return { ...super.getReactProps(), item: this.item } }
    abstract Component: React.ComponentType<any>

    protected async _onDrop(event: DragEvent): Promise<boolean | void> {
        event.preventDefault()
        /**
         * Handles dragging items from an actor sheet onto an item (container). The item's
         * info is embedded into the drag event in DragDrop.tsx so it can be passed along
         * through Foundry's backend data transforms and extracted using their getDragEventData()
         * util function.
         */
        if (this.item.system instanceof ContainerDataModel) {
            const dragData = foundry.applications.ux.TextEditor.getDragEventData(event)
            if (!dragData || (dragData as any)?.type as JSONValue !== "Item") return super._onDrop(event)

            const itemId = (dragData as any).id
            if (!itemId) return super._onDrop(event)

            const droppedItem = this.item.actor.items.get(itemId)
            if (!droppedItem) return super._onDrop(event)

            /**
             * If the function got this far, add the item to this container.
             */
            return addItemToContainer(this.item.system, droppedItem)
        }

        return super._onDrop(event)
    }
    
}