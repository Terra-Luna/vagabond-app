import { useCallback, useState } from "react"
import { DiceRollComponent } from "../../view/chat/component/DiceRollComponent"
import { useDragOverlayComponent } from "../overlay/usecase/DragOverlayUseCase"
import { checkCountdownPermission, CountdownSetting, getCountdowns, setCountdowns } from "../vagabond-tools/VagabondSettingsRegistry"
import { useOverlayItemSync } from "../overlay/usecase/OverlayItemSyncUseCase"
import { CountdownRoll } from "../../combat/engine/CountdownRoll"
import { CanvasOverlayObjectWrapper } from "../overlay/component/CanvasOverlayObjectWrapper"
import { Minus, Plus, Trash, X } from "lucide-react"
import { useContextMenu } from "../../view/component/ContextMenu"

export const CountdownAppView = () => {

    const [cds, setCds] = useState<CountdownSetting[]>([])
    const { dragInfo, handleMouseDown } = useDragOverlayComponent(setCds, setCountdowns, checkCountdownPermission)
    const { ContextMenu, onCtxMenu } = useContextMenu()

    useOverlayItemSync(setCds, getCountdowns, "vagabond-lite.countdowns")

    const handleCountdownClick = useCallback(async (cdId: string) => {
        if (dragInfo.current?.hasMoved) return
        if (!checkCountdownPermission()) return

        const countdown = cds.find(cd => cd.id === cdId)
        if (!countdown || countdown.result.duration === 0) return

        const roll = new CountdownRoll(countdown.result)
        await roll.roll()

        await setCountdowns(cds.map((countdown: any) => {
            if (countdown.id === cdId) {
                return { ...countdown, result: roll.result }
            }
            return countdown
        }))
    }, [cds])

    const increaseSize = useCallback(async (cdId: string) => {
        const target = cds.find(cd => cd.id === cdId)
        if (!target) return

        const duration = target.result.duration === 12 ? 12 : target.result.duration + 2
        await setCountdowns(cds.map((countdown: any) => {
            if (countdown.id === cdId) return updateCountdownDuration(countdown, duration)
            return countdown
        }))
    }, [cds])

    const decreaseSize = useCallback(async (cdId: string) => {
        const target = cds.find(cd => cd.id === cdId)
        if (!target) return
        const duration = target.result.duration === 4 ? 4 : target.result.duration - 2
        await setCountdowns(cds.map((countdown: any) => {
            if (countdown.id === cdId) return updateCountdownDuration(countdown, duration)
            return countdown
        }))
    }, [cds])

    const updateCountdownDuration = (countdown: CountdownSetting, duration: number) => {
        return {
            ...countdown, result: {
                ...countdown.result, duration: duration, rollSummary: {
                    ...countdown.result.rollSummary, faces: duration
                }
            }
        }
    }

    const deleteCountdown = useCallback(async (cdId: string) => {
        await setCountdowns(cds.filter(cd => cd.id !== cdId))
    }, [cds])

    return (<>
        <CanvasOverlayObjectWrapper objects={cds} onMouseDown={handleMouseDown}>
            {(countdown: CountdownSetting) => (
                <div className="flex flex-col bg-sheet-main-fill/50 p-0.5 rounded pointer-events-auto"
                    onContextMenu={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        onCtxMenu(e, [
                            { label: "Increase Size", icon: Plus, action: async () => await increaseSize(countdown.id) },
                            { label: "Decrease Size", icon: Minus, action: async () => await decreaseSize(countdown.id) },
                            { label: "Delete", icon: Trash, action: async () => await deleteCountdown(countdown.id), isDestructive: true }
                        ])
                    }}
                >
                    {/* DIE ICON AND BUTTON */}
                    <button
                        title={`Click to advance\nR-click for options`}
                        className="hover-glow transition-transform active:scale-95"
                        onClick={(e) => handleCountdownClick(countdown.id)}
                    >
                        <DiceRollComponent
                            faces={countdown.result.rollSummary?.faces ?? countdown.result.duration}
                            result={countdown.result.rollSummary?.result ?? ''}
                            textSize="text-6xl"
                        />
                    </button>

                    {/* LABEL */}
                    {countdown.result.name && (
                        <div className="w-full text-center -mt-1">{countdown.result.name}</div>
                    )}
                </div>
            )}
        </CanvasOverlayObjectWrapper>
        <ContextMenu />
    </>)
}