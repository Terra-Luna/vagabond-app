const { sheets } = foundry.applications
import { JSONValue } from "@league-of-foundry-developers/foundry-vtt-types/utils"
import { ActorDataModel, BaseActorSchema } from "../../../model/actor/ActorDataModel"
import { extractItemFromContainer } from "../../../model/item/equip/ContainerDataModel"
import { VgLiteSheetMixin } from "../VgLiteSheetMixin"
import { deleteItemStack } from "../../../utils/heroInventoryUtil"

export abstract class VgLiteActorSheet extends VgLiteSheetMixin(sheets.ActorSheetV2) {
    getReactProps() { return { ...super.getReactProps(), actor: this.actor } }
    abstract Component: React.ComponentType<any>

    protected async _onDrop(event: DragEvent): Promise<boolean | void> {
        event.preventDefault()

        /**
         * Handles dragging items from a container onto an Actor sheet. The
         * item's info is embedded into the drag event in DragDrop.tsx so it
         * can be passed along through Foundry's backend data transforms and
         * extracted using their getDragEventData() util function.
         */
        const dragData = foundry.applications.ux.TextEditor.getDragEventData(event)
        if (!dragData || (dragData as any)?.type as JSONValue !== "Item") return super._onDrop(event)

        const itemId = (dragData as any).id
        if (!itemId) return super._onDrop(event)

        const originalOwner = game.actors?.get((dragData as any).owner._id) as Actor & { system: ActorDataModel<BaseActorSchema> }
        const droppedItem = this.actor.items.get(itemId)

        /**
         * If the actor doesn't already have this item, check to see if this
         * is an inter-actor item transfer.
         */
        if (!droppedItem) {
            if (originalOwner) {
                super._onDrop(event)
                await deleteItemStack(originalOwner?.system, [itemId])
                return true
            }
            else {
                return super._onDrop(event)
            }
        }

        const container = this.actor.items.find(item => {
            return item.type === 'container' && item.system?.itemIds?.includes(itemId)
        })

        /**
         * Extract the item from the container back to the actor's main inventory.
         */
        if (container) {
            extractItemFromContainer(container.system, droppedItem)
            return true
        }

        /**
         * Complete an inter-actor item transfer of an existing item.
         */
        if (originalOwner && originalOwner.id !== droppedItem.actor.id) {
            super._onDrop(event)
            await deleteItemStack(originalOwner?.system, [itemId])
            return true
        }

        return super._onDrop(event)
    }

}