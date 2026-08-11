import { useRef } from "react"

export const useDragOverlayComponent = (setState: (prev) => void, saveSetting: (objects) => void, permissionCheck: () => boolean) => {

    const dragInfo = useRef<{
        id: string
        startX: number
        startY: number
        initialX: number
        initialY: number
        hasMoved: boolean
        width: number
        height: number
    } | null>(null)

    const handleMouseDown = (e: React.MouseEvent, object: any) => {
        if (!permissionCheck()) return
        e.preventDefault()

        const targetElement = e.currentTarget as HTMLElement
        const rect = targetElement.getBoundingClientRect()

        dragInfo.current = {
            id: object.id,
            startX: e.clientX,
            startY: e.clientY,
            initialX: object.x || 0,
            initialY: object.y || 0,
            hasMoved: false,
            width: rect.width,
            height: rect.height
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
            // Prevent off-screen drags.
            const rawX = info.initialX + deltaX
            const rawY = info.initialY + deltaY
            const clampedX = Math.max(0, Math.min(rawX, window.innerWidth - info.width))
            const clampedY = Math.max(0, Math.min(rawY, window.innerHeight - info.height))

            setState(prev => prev.map(c => {
                if (c.id === info.id) {
                    return {
                        ...c,
                        x: clampedX,
                        y: clampedY
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