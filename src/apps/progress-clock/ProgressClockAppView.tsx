import React, { useState, useEffect, useRef } from 'react'
import { checkClockPermission, getProgressClocks, setProgressClocks } from '../vagabond-tools/VagabondSettingsRegistry'

export default function ProgressClockAppView() {
    const [clocks, setClocks] = useState<any[]>([])

    const dragInfo = useRef<{
        clockId: string
        startX: number
        startY: number
        initialX: number
        initialY: number
        hasMoved: boolean
    } | null>(null)

    useEffect(() => {
        const updateClocks = () => {
            const worldClocks = getProgressClocks()
            setClocks(worldClocks)
        }

        updateClocks()

        const onUpdateSetting = (setting: any, change: any) => {
            if (setting.key === "vagabond-lite.progressClocks") {
                updateClocks()
            }
        }

        Hooks.on("updateSetting", onUpdateSetting)
        Hooks.on("canvasReady", updateClocks)

        return () => {
            Hooks.off("updateSetting", onUpdateSetting)
            Hooks.off("canvasReady", updateClocks)
        }
    }, [])

    const handleClockClick = async (clockId: string) => {
        if (dragInfo.current?.hasMoved) return
        if (!checkClockPermission()) return

        const activeScene = (game as any).scenes?.active
        if (!activeScene) return

        const updatedClocks = clocks.map((c: any) => {
            if (c.id === clockId) {
                const nextValue = (c.value + 1) > c.max ? 0 : c.value + 1
                return { ...c, value: nextValue }
            }
            return c
        })

        await setProgressClocks(updatedClocks)
    }

    const handleMouseDown = (e: React.MouseEvent, clock: any) => {
        if (!checkClockPermission()) return
        e.preventDefault()

        dragInfo.current = {
            clockId: clock.id,
            startX: e.clientX,
            startY: e.clientY,
            initialX: clock.x || 0,
            initialY: clock.y || 0,
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
            setClocks(prevClocks => prevClocks.map(c => {
                if (c.id === info.clockId) {
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
            const activeScene = (game as any).scenes?.active
            if (activeScene) {
                setClocks(currentClocks => {
                    setProgressClocks(currentClocks)
                    return currentClocks
                })
            }
        }

        setTimeout(() => { dragInfo.current = null }, 50)
    }

    return (
        <div className="canvas-overlay-viewport font-eskapade font-bold text-text-primary">
            {clocks.map((clock: any) => {
                const screenX = clock.x || 0
                const screenY = clock.y || 0
                return (
                    <div
                        key={clock.id}
                        style={{
                            left: `${screenX}px`,
                            top: `${screenY}px`,
                            transform: `translate(-50%, -50%)`,
                            position: 'absolute',
                            cursor: checkClockPermission() ? 'move' : 'default'
                        }}
                        className="flex flex-col items-center justify-center bg-sheet-main-fill/50 border border-solid border-table-border rounded-full p-2 select-none pointer-events-auto"
                        onMouseDown={(e) => handleMouseDown(e, clock)}
                        onClick={() => handleClockClick(clock.id)}
                    >
                        <div className="">
                            <span className="">
                                {clock.value} / {clock.max}
                            </span>
                        </div>

                        <div className="text-lg">
                            {clock.name}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
