import { useRef } from "react"

export const useDragOverlayComponent = (
    setState: (prev: any) => void,
    saveSetting: (objects: any) => void,
    permissionCheck: () => boolean
) => {

    const dragInfo = useRef<{
        id: string
        startX: number
        startY: number
        initialPixelX: number
        initialPixelY: number
        hasMoved: boolean
        width: number
        height: number
    } | null>(null)

    const handleMouseDown = (e: React.MouseEvent, object: any) => {
        if (!permissionCheck()) return
        e.preventDefault()

        const targetElement = e.currentTarget as HTMLElement
        const rect = targetElement.getBoundingClientRect()

        // Translate positional percentages to pixel coords.
        const initialPixelX = (object.x || 0) * window.innerWidth
        const initialPixelY = (object.y || 0) * window.innerHeight

        dragInfo.current = {
            id: object.id,
            startX: e.clientX,
            startY: e.clientY,
            initialPixelX,
            initialPixelY,
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
            const rawX = info.initialPixelX + deltaX
            const rawY = info.initialPixelY + deltaY

            // Clamp pixels to screen edges
            const clampedPixelX = Math.max(0, Math.min(rawX, window.innerWidth - info.width))
            const clampedPixelY = Math.max(0, Math.min(rawY, window.innerHeight - info.height))

            // Convert clamped pixels to a relative percentage (0.0 to 1.0)
            const relativeX = clampedPixelX / window.innerWidth
            const relativeY = clampedPixelY / window.innerHeight

            setState(prev => prev.map(c => {
                if (c.id === info.id) {
                    return {
                        ...c,
                        x: relativeX,
                        y: relativeY
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
