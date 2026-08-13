import { useState } from "react"
import { getId, getUuid } from "../../utils/modelUtil"
import { EquipmentDataModel, EquipmentSchema } from "../../model/item/equip/EquipmentDataModel"

/**
 * Provides drag-drop functionality for inventory items. Consuming
 * function must provide a method for what to do with the item
 * being dragged when it's dropped.
 * @param items 
 * @param onDrop 
 * @returns 
 */
export const useDragDrop = (items: EquipmentDataModel<EquipmentSchema>[], onDrop: () => void) => {
    const [dragIndex, setDragIndex] = useState<number | null>(null)
    const [dragItem, setDragItem] = useState<any>(null)
    const [targetItem, setTargetItem] = useState<any>(null)

    const onDragStart = (e: React.DragEvent<any>, index: number) => {
        e.stopPropagation()
        setDragIndex(index)
        setDragItem(items[index])
        setTargetItem(items[index])
        const dragData = {
            type: "Item",
            id: getId(items[index]),
            uuid: getUuid(items[index]),
            owner: items[index].parent.actor
        }
        e.dataTransfer.setData("text/plain", JSON.stringify(dragData))
        e.dataTransfer.effectAllowed = "move"
        e.dataTransfer.dropEffect = "move"
    }

    const onDragEnter = (e: any, index: number) => {
        if (dragIndex === null || dragIndex === index) return
        e.preventDefault()
        e.stopPropagation()
        e.dataTransfer.dropEffect = "move"
        setDragIndex(index)
        setTargetItem(items[index])
    }

    const onDragLeave = (e: any) => {
        e.preventDefault()
        e.stopPropagation()
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setTargetItem(null)
        }
    }

    const onDragEnd = (e: any, index: number) => {
        if (dragIndex === null || dragIndex === index) {
            nullifyAll()
            return
        }
        e.preventDefault()
        e.stopPropagation()
        setTargetItem(items[index])

        try {
            onDrop()
        }
        catch (error) {
            console.error(error)
        }
        finally {
            nullifyAll()
        }
    }

    const nullifyAll = () => {
        setDragIndex(null)
        setDragItem(null)
        setTargetItem(null)
    }

    return {
        dragIndex,
        dragItem,
        targetItem,
        onDragStart,
        onDragEnter,
        onDragLeave,
        onDragEnd
    }
}