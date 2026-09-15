import { ClassDataModel } from "../../../../../model/item/character/ClassDataModel"
import { FeatureDataModel } from "../../../../../model/item/character/FeatureDataModel"
import { VagabondItemSheet } from "../../VagabondItemSheet"
import { ClassSheetComponent } from "./ClassSheetComponent"

export class ClassSheet extends VagabondItemSheet {
    Component = ClassSheetComponent
    private featureDropEnabled = false
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

    override getReactProps() {
        return {
            ...super.getReactProps(),
            setFeatureDropEnabled: (enabled: boolean) => {
                this.featureDropEnabled = enabled
            }
        }
    }

    protected async _onDrop(event: DragEvent): Promise<boolean | void> {
        if (!game.user?.isActiveGM || !this.featureDropEnabled) return false

        const eventPath = event.composedPath?.() ?? []
        const dropTarget = eventPath.find((node): node is HTMLElement =>
            node instanceof HTMLElement && node.dataset.featureDropTarget === "true"
        )
        if (!dropTarget || !eventPath.includes(this.element)) return false

        const dragData = foundry.applications.ux.TextEditor.getDragEventData(event) as any
        if (dragData?.type !== "Item") return super._onDrop(event)

        const droppedItem = await (Item as any).fromDropData(dragData) as Item | undefined
        if (!(droppedItem?.system instanceof FeatureDataModel) || !(this.item.system instanceof ClassDataModel)) {
            return super._onDrop(event)
        }

        const featureIds = [...(this.item.system.featureIds ?? [])]
        if (!featureIds.includes(droppedItem.uuid)) {
            await this.item.update({ "system.featureIds": [...featureIds, String(droppedItem.uuid)] })
        }
        return false
    }

    async close(options = {}) {
        const result = await super.close(options)

        const defaults = ClassSheet.DEFAULT_OPTIONS.position
        this.position.width = defaults.width
        this.position.height = defaults.height

        return result
    }
}