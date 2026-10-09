import { useCallback, useState } from "react"

import { sys_id } from "../../../../utils/foundryUtils"
import { RollPreset } from "../../model/RollPreset"
import { updatePresets } from "./SavePresetUseCase"

export const useReorderPreset = (actor: Actor) => {

    const [dragIndex, setDragIndex] = useState<number | null>(null)

    const onDragStart = useCallback((e: React.DragEvent, preset: RollPreset, index: number) => {
        e.stopPropagation()
        if (!preset.id) {
            preset.id = foundry.utils.randomID()
            updatePresets(actor, preset)
        }
        setDragIndex(index)
        const dragData = {
            type: "RollPreset",
            id: preset.id,
            uuid: preset.id,
            owner: actor.id
        }
        e.dataTransfer.setData("text/plain", JSON.stringify(dragData))
        e.dataTransfer.effectAllowed = "move"
        e.dataTransfer.dropEffect = "move"
    }, [])

    const onDragEnter = useCallback((e: React.DragEvent, index: number) => {
        if (dragIndex === null || dragIndex === index) return
        e.preventDefault()
        e.stopPropagation()
        e.dataTransfer.dropEffect = "move"
    }, [dragIndex])

    const onDrop = useCallback(async (e: React.DragEvent, index: number) => {
        e.preventDefault()
        e.stopPropagation()
        if (dragIndex === null || dragIndex === index) return

        const presets = [...actor.getFlag(sys_id, "rollPresets" as any) as RollPreset[] ?? []]
        const [moved] = presets.splice(dragIndex, 1)
        presets.splice(index, 0, moved)

        await actor.setFlag(sys_id, "rollPresets", presets)
    }, [actor, dragIndex])

    const onDragEnd = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragIndex(null)
    }, [])

    return { dragIndex, onDragStart, onDragEnter, onDrop, onDragEnd }
}
