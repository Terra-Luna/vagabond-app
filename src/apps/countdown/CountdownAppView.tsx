import { useCallback, useState } from "react"
import { DiceRollComponent } from "../../view/chat/component/DiceRollComponent"
import { useDragOverlayComponent } from "../overlay/usecase/DragOverlayUseCase"
import { useOverlayItemSync } from "../overlay/usecase/OverlayItemSyncUseCase"
import { CanvasOverlayObjectWrapper } from "../overlay/component/CanvasOverlayObjectWrapper"
import { Minus, Plus, Trash } from "lucide-react"
import { useContextMenu } from "../../view/component/ContextMenu"
import { WidgetLabel } from "../overlay/component/WidgetLabel"
import { CountdownRoll } from "../../combat/engine/roll/CountdownRoll"
import { CountdownSchema, setCountdowns, checkCountdownPermission, getCountdowns } from "../vagabond-tools/usecase/VagabondSettingsHelper"

export const CountdownAppView = () => {

    const [cds, setCds] = useState<CountdownSchema[]>([])
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

        const duration = target.result.duration === 12
            ? 20
            : (target.result.duration === 20
                ? 20
                : target.result.duration + 2
            )

        await setCountdowns(cds.map((countdown: any) => {
            if (countdown.id === cdId) return updateCountdownDuration(countdown, duration)
            return countdown
        }))
    }, [cds])

    const decreaseSize = useCallback(async (cdId: string) => {
        const target = cds.find(cd => cd.id === cdId)
        if (!target) return
        const duration = target.result.duration === 4
            ? 4
            : (target.result.duration === 20
                ? 12
                : target.result.duration - 2
            )

        await setCountdowns(cds.map((countdown: any) => {
            if (countdown.id === cdId) return updateCountdownDuration(countdown, duration)
            return countdown
        }))
    }, [cds])

    const updateCountdownDuration = (countdown: CountdownSchema, duration: number) => {
        return {
            ...countdown, result: {
                ...countdown.result, duration: duration, rollSummary: {
                    ...countdown.result.rollSummary, faces: duration
                }
            }
        }
    }

    const updateLabel = useCallback(async (countdown: CountdownSchema, label: string) => {
        const updatedCountdown = {
            ...countdown, result: {
                ...countdown.result, name: label
            }
        }

        await setCountdowns(cds.map((cd: CountdownSchema) => {
            if (cd.id === countdown.id) return updatedCountdown
            else return cd
        }))
    }, [cds])

    const deleteCountdown = useCallback(async (cdId: string) => {
        await setCountdowns(cds.filter(cd => cd.id !== cdId))
    }, [cds])

    return (<>
        <CanvasOverlayObjectWrapper objects={cds} onMouseDown={handleMouseDown}>
            {(countdown: CountdownSchema) => (
                <div className={`flex flex-col p-0.5 rounded pointer-events-auto items-center`}
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
                    <div className={`
                        relative flex items-center justify-center rounded-full aspect-square border border-solid border-dice
                        ${countdown.result.duration === 0 ? 'bg-destructive-action/33' : 'bg-sheet-main-fill/15'}
                    `}>
                        <button
                            title={`Click to roll\nR-click for options`}
                            className="hover-glow transition-transform active:scale-95 focus:outline-none mt-2.5"
                            onClick={() => handleCountdownClick(countdown.id)}
                        >
                            <DiceRollComponent
                                faces={countdown.result.rollSummary?.faces ?? countdown.result.duration}
                                result={countdown.result.rollSummary?.result ?? ''}
                                textSize="text-6xl"
                            />
                        </button>
                    </div>

                    {/* LABEL */}
                    <WidgetLabel label={countdown.result.name} onLabelChange={(newlabel) => updateLabel(countdown, newlabel)} permissionCheck={checkCountdownPermission} />
                </div>
            )}
        </CanvasOverlayObjectWrapper>

        {checkCountdownPermission() && <ContextMenu />}

    </>)
}