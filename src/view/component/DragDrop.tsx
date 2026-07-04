import { useState } from "react"
import { getId, getName, getUuid } from "../../utils/modelUtil"

/**
 * Provides drag-drop functionality for anything. Consuming
 * function must provide a method for what to do with the item
 * being dragged when it's dropped.
 * @param items 
 * @param onDrop 
 * @returns 
 */
export const useDragDrop = (items: any[], onDrop: () => void) => {
    const [dragIndex, setDragIndex] = useState<number | null>(null)
    const [dragItem, setDragItem] = useState<any>(null)
    const [targetItem, setTargetItem] = useState<any>(null)

    const onDragStart = (e: React.DragEvent<any>, index: number) => {
        e.stopPropagation()
        setDragIndex(index)
        setDragItem(items[index])
        setTargetItem(items[index])
        const dragData = { type: "Item", id: getId(items[index]), uuid: getUuid(items[index]) }
        //console.log("Dragging:", getName(items[index]), index, dragData)
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
        //console.log("Dragging:", getName(dragItem), "above:", getName(targetItem), index)
    }

    const onDragEnd = (e: any, index: number) => {
        if (dragIndex === null || dragIndex === index) {
            nullifyAll()
            return
        }
        e.preventDefault()
        e.stopPropagation()
        setTargetItem(items[index])
        //console.log("Dropping:", getName(dragItem), "onto:", getName(targetItem ?? items[items.length - 1]), index)

        try {
            onDrop()
        }
        catch (error) {
            console.log(error)
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
        onDragEnd
    }
}