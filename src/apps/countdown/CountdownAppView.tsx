import { Minus, Plus, Trash, User } from "lucide-react"
import { useCallback, useState } from "react"

import { CountdownRoll } from "../../combat/engine/roll/CountdownRoll"
import { sys_id } from "../../utils/foundryUtils"
import { DiceRollComponent } from "../../view/chat/component/DiceRollComponent"
import { CtxMenuItem, useContextMenu } from "../../view/component/ContextMenu"
import { CanvasOverlayObjectWrapper } from "../overlay/component/CanvasOverlayObjectWrapper"
import { WidgetLabel } from "../overlay/component/WidgetLabel"
import { useDragOverlayComponent } from "../overlay/usecase/DragOverlayUseCase"
import { useOverlayItemSync } from "../overlay/usecase/OverlayItemSyncUseCase"
import { useOverlayObjectPermissionsMenu } from "../overlay/usecase/OverlayObjectPermissionsMenuUseCase"
import {
    canInteractWithOverlayObject, checkCountdownPermission, CountdownSchema, getCountdownPlayerDefaultPermission, getCountdowns,
    setCountdowns
} from "../vagabond-tools/usecase/VagabondSettingsHelper"

export const CountdownAppView = () => {

    const [cds, setCds] = useState<CountdownSchema[]>([])
    const { dragInfo, handleMouseDown } = useDragOverlayComponent(setCds, setCountdowns,
        (countdown: CountdownSchema) => canInteractWithOverlayObject(countdown, checkCountdownPermission))
    const { ContextMenu, onCtxMenu } = useContextMenu()

    useOverlayItemSync(setCds, getCountdowns, `${sys_id}.countdowns`)

    const { itemsRef: cdsRef, visibleItems, gmMenuItems } = useOverlayObjectPermissionsMenu(
        cds, setCountdowns, getCountdownPlayerDefaultPermission)

    const handleCountdownClick = useCallback(async (cdId: string) => {
        if (dragInfo.current?.hasMoved) return

        const countdown = cdsRef.current.find(cd => cd.id === cdId)
        if (!countdown || countdown.result.duration === 0) return
        if (!canInteractWithOverlayObject(countdown, checkCountdownPermission)) return

        const roll = new CountdownRoll(countdown.result)
        await roll.roll()

        await setCountdowns(cdsRef.current.map((countdown: any) => {
            if (countdown.id === cdId) {
                return { ...countdown, result: roll.result }
            }
            return countdown
        }))
    }, [cdsRef])

    const increaseSize = useCallback(async (cdId: string) => {
        const target = cdsRef.current.find(cd => cd.id === cdId)
        if (!target) return

        const duration = target.result.duration === 12
            ? 20
            : (target.result.duration === 20
                ? 20
                : target.result.duration + 2
            )

        await setCountdowns(cdsRef.current.map((countdown: any) => {
            if (countdown.id === cdId) return updateCountdownDuration(countdown, duration)
            return countdown
        }))
    }, [cdsRef])

    const decreaseSize = useCallback(async (cdId: string) => {
        const target = cdsRef.current.find(cd => cd.id === cdId)
        if (!target) return
        const duration = target.result.duration === 4
            ? 4
            : (target.result.duration === 20
                ? 12
                : target.result.duration - 2
            )

        await setCountdowns(cdsRef.current.map((countdown: any) => {
            if (countdown.id === cdId) return updateCountdownDuration(countdown, duration)
            return countdown
        }))
    }, [cdsRef])

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

        await setCountdowns(cdsRef.current.map((cd: CountdownSchema) => {
            if (cd.id === countdown.id) return updatedCountdown
            else return cd
        }))
    }, [cdsRef])

    const deleteCountdown = useCallback(async (cdId: string) => {
        await setCountdowns(cdsRef.current.filter(cd => cd.id !== cdId))
    }, [cdsRef])

    const openLinkedActorSheet = useCallback(async (actorId?: string, tokenUuid?: string) => {
        if (tokenUuid) {
            const token = await fromUuid(tokenUuid) as TokenDocument | null
            if (token?.actor) {
                (token.actor.sheet as any)?.render(true)
                return
            }
        }
        if (actorId) {
            (game.actors?.get(actorId)?.sheet as any)?.render(true)
        }
    }, [])

    const countdownMenuItems = (countdown: CountdownSchema): CtxMenuItem[] => {
        const canInteract = canInteractWithOverlayObject(countdown, checkCountdownPermission)
        return [
            ...(canInteract ? [
                { label: "Increase Size", icon: Plus, action: async () => await increaseSize(countdown.id) },
                { label: "Decrease Size", icon: Minus, action: async () => await decreaseSize(countdown.id) }
            ] : []),
            ...(countdown.result.actorUuid ? [{ label: "Open Actor Sheet", icon: User, action: () => openLinkedActorSheet(countdown.result.actorUuid, countdown.result.tokenUuid) }] : []),
            ...gmMenuItems(countdown),
            ...(canInteract ? [{ label: "Delete", icon: Trash, action: async () => await deleteCountdown(countdown.id), isDestructive: true }] : [])
        ]
    }

    return (<>
        <CanvasOverlayObjectWrapper objects={visibleItems} onMouseDown={handleMouseDown}>
            {(countdown: CountdownSchema) => (
                <div className={`flex flex-col p-0.5 rounded pointer-events-auto items-center`}
                    onContextMenu={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        const items = countdownMenuItems(countdown)
                        if (items.length === 0) return
                        onCtxMenu(e, items)
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

        <ContextMenu />

    </>)
}