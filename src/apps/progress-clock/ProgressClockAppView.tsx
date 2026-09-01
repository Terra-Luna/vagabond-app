import { Trash, Undo } from 'lucide-react'
import { useState } from 'react'

import { sys_id } from '../../utils/foundryUtils'
import { vgLiteLang } from '../../utils/lang'
import { useContextMenu } from '../../view/component/ContextMenu'
import { CanvasOverlayObjectWrapper } from '../overlay/component/CanvasOverlayObjectWrapper'
import { WidgetLabel } from '../overlay/component/WidgetLabel'
import { useDragOverlayComponent } from '../overlay/usecase/DragOverlayUseCase'
import { useOverlayItemSync } from '../overlay/usecase/OverlayItemSyncUseCase'
import { checkClockPermission, getProgressClocks,ProgressClockSchema, setProgressClocks } from '../vagabond-tools/usecase/VagabondSettingsHelper'

export const ProgressClockAppView = () => {

    const [clocks, setClocks] = useState<ProgressClockSchema[]>([])
    const { ContextMenu, onCtxMenu } = useContextMenu()
    const { dragInfo, handleMouseDown } = useDragOverlayComponent(setClocks, setProgressClocks, checkClockPermission)

    useOverlayItemSync(setClocks, getProgressClocks, `${sys_id}.progressClocks`)

    const incrementClock = async (clockId: string) => {
        if (dragInfo.current?.hasMoved) return
        if (!checkClockPermission()) return

        const updatedClocks = clocks.map((clock: ProgressClockSchema) => {
            if (clock.id === clockId) return { ...clock, filled: (clock.filled + 1) > clock.segments ? 0 : clock.filled + 1 }
            else return clock
        })

        await setProgressClocks(updatedClocks)
    }

    const updateLabel = async (clockId: string, newLabel: string) => {
        const updatedClocks = clocks.map((clock: ProgressClockSchema) => {
            if (clock.id === clockId) return { ...clock, label: newLabel }
            else return clock
        })

        await setProgressClocks(updatedClocks)
    }

    const reduceProgress = async (clockId: string) => {
        await setProgressClocks(clocks.map((clock: ProgressClockSchema) => {
            if (clock.id === clockId) return { ...clock, filled: (Math.max(0, clock.filled - 1)) }
            else return clock
        }))
    }

    const deleteClock = async (clockId: string) => {
        await setProgressClocks(clocks.filter(clock => clock.id !== clockId))
    }

    return (<>
        <CanvasOverlayObjectWrapper objects={clocks} onMouseDown={handleMouseDown}>
            {(clock) => (
                <div title={`Click to advance\nR-click for options`} onContextMenu={(e) => onCtxMenu(e, [
                    { label: "Reduce Progress", icon: Undo, action: async () => await reduceProgress(clock.id) },
                    { label: vgLiteLang.ButtonActions.delete, icon: Trash, action: async () => await deleteClock(clock.id), isDestructive: true }
                ])}>
                    <ProgressClock
                        label={clock.label}
                        segments={clock.segments}
                        filled={clock.filled}
                        size={66}
                        onClockClick={() => incrementClock(clock.id)}
                        onLabelChange={(newLabel) => updateLabel(clock.id, newLabel)}
                    />
                </div>

            )}
        </CanvasOverlayObjectWrapper>

        {checkClockPermission() && <ContextMenu />}

    </>)
}

interface ProgressClockProps {
    label?: string
    segments: number
    filled: number
    size?: number
    onClockClick: () => void
    onLabelChange: (newLabel: string) => void
}

export const ProgressClock: React.FC<ProgressClockProps> = ({
    label,
    segments,
    filled,
    size = 120,
    onClockClick,
    onLabelChange
}) => {
    const center = size / 2
    const radius = (size / 2) * 0.85
    const anglePerSegment = 360 / segments

    const getSegmentPath = (index: number): string => {
        const startAngle = index * anglePerSegment - 90
        const endAngle = (index + 1) * anglePerSegment - 90

        const startRad = (startAngle * Math.PI) / 180
        const endRad = (endAngle * Math.PI) / 180

        const x1 = center + radius * Math.cos(startRad)
        const y1 = center + radius * Math.sin(startRad)
        const x2 = center + radius * Math.cos(endRad)
        const y2 = center + radius * Math.sin(endRad)

        const arc = anglePerSegment > 180 ? 1 : 0

        return `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${arc} 1 ${x2} ${y2} Z`
    }

    const hoverEffect = "transform transition-transform duration-300 hover:scale-105"

    return (
        <div className="flex flex-col items-center justify-center p-1 rounded-xl shadow-md w-fit">
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className={hoverEffect}
                onClick={() => onClockClick()}
            >
                {/* BORDER */}
                < circle cx={center} cy={center} r={radius} className="fill-none stroke-sheet-header-fill stroke-[4px]" />

                {/* WEDGE SEGMENTS */}
                {Array.from({ length: segments }).map((_, index) => {
                    const isFilled = index < filled
                    return (
                        <path
                            key={index}
                            d={getSegmentPath(index)}
                            className={`stroke-sheet-header-fill stroke-[2px]
                               ${isFilled ? 'fill-destructive-action/66' : 'fill-sheet-header-fill/33'}
                            `}
                        />
                    )
                })}

                {/* CIRCLE HOST WITH HUB */}
                <circle cx={center} cy={center} r={3} className="fill-sheet-header-fill" />

            </svg>

            {/* LABEL */}
            <WidgetLabel label={label ?? 'Clock'} onLabelChange={onLabelChange} permissionCheck={checkClockPermission} />

        </div >
    )
}