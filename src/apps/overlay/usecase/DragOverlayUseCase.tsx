import { useRef } from "react"

export const useDragOverlayComponent = (setState: (prev) => void, saveSetting: (objects) => void, permissionCheck: () => void) => {

    const dragInfo = useRef<{
        id: string
        startX: number
        startY: number
        initialX: number
        initialY: number
        hasMoved: boolean
    } | null>(null)

    const handleMouseDown = (e: React.MouseEvent, object: any) => {
        if (!permissionCheck) return
        e.preventDefault()

        dragInfo.current = {
            id: object.id,
            startX: e.clientX,
            startY: e.clientY,
            initialX: object.x || 0,
            initialY: object.y || 0,
            hasMoved: false
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
    }

    const handleMouseMove = (e: MouseEvent) => {
        if (!dragInfo.current) return

        const info = dragInfo.current
        const deltaX = e.clientX - info.startX
        const deltaY = e.clientY - info.startY

        if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
            info.hasMoved = true
        }

        if (info.hasMoved) {
            setState(prev => prev.map(c => {
                if (c.id === info.id) {
                    return {
                        ...c,
                        x: info.initialX + deltaX,
                        y: info.initialY + deltaY
                    }
                }
                return c
            }))
        }
    }

    const handleMouseUp = async (e: MouseEvent) => {
        if (!dragInfo.current) return

        const info = dragInfo.current
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)

        if (info.hasMoved) {
            setState(objects => {
                saveSetting(objects)
                return objects
            })
        }

        setTimeout(() => { dragInfo.current = null }, 50)
    }

    return { dragInfo, handleMouseDown, handleMouseUp, handleMouseMove }
}