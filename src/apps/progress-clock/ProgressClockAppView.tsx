import { useState, useEffect } from 'react'
import { checkClockPermission, getProgressClocks, setProgressClocks } from '../vagabond-tools/VagabondSettingsRegistry'
import { useDragOverlayComponent } from '../overlay/usecase/DragOverlayUseCase'
import { useOverlayItemSync } from '../overlay/usecase/OverlayItemSyncUseCase'
import { CanvasOverlayObjectWrapper } from '../overlay/component/CanvasOverlayObjectWrapper'

export const ProgressClockAppView = () => {
    const [clocks, setClocks] = useState<any[]>([])
    const { dragInfo, handleMouseDown } = useDragOverlayComponent(setClocks, setProgressClocks, checkClockPermission)

    useOverlayItemSync(setClocks, getProgressClocks, "vagabond-lite.progressClocks")

    const incrementClock = async (clockId: string) => {
        if (dragInfo.current?.hasMoved) return
        if (!checkClockPermission()) return

        const updatedClocks = clocks.map((c: any) => {
            if (c.id === clockId) {
                const nextValue = (c.value + 1) > c.max ? 0 : c.value + 1
                return { ...c, value: nextValue }
            }
            return c
        })

        await setProgressClocks(updatedClocks)
    }

    return (
        <CanvasOverlayObjectWrapper objects={clocks} onMouseDown={handleMouseDown}>
            {(clock) => (<>
                <div onClick={() => incrementClock(clock.id)}>
                    {clock.value} / {clock.max}
                </div>
                <div>
                    {clock.name}
                </div>
            </>)}
        </CanvasOverlayObjectWrapper>
    )
}