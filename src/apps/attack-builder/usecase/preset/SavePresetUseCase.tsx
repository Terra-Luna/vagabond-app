import { useCallback } from "react"

import { sys_id } from "../../../../utils/foundryUtils"
import { RollPreset } from "../../model/RollPreset"

export const useSavePreset = (actor: Actor, preset: RollPreset) => {

    const savePreset = useCallback(async (closeApp: () => void) => {
        if (!preset) return
        await updatePresets(actor, preset)
        closeApp()
    }, [actor, preset])

    const saveCustomRoll = useCallback(async () => {
        if (!preset) return
        await actor.setFlag(sys_id, "customRoll" as any, preset)
    }, [actor, preset])

    return { savePreset, saveCustomRoll }
}

export const updatePresets = async (actor: Actor, preset: RollPreset) => {
    const presets = [...actor.getFlag(sys_id, "rollPresets" as any) as RollPreset[] ?? []]

    // Back-fill any missing Id's
    presets.forEach(p => { if (!p.id) p.id = foundry.utils.randomID() })

    // Set new Id if it wasn't already set (edit mode)
    if (!preset.id) preset.id = foundry.utils.randomID()

    const updated: RollPreset[] = presets.some(p => p.id === preset.id)
        ? [...presets.filter(it => it.id !== preset.id), preset]
        : [...presets, preset]

    if (updated.length > 0) {
        await actor.setFlag(sys_id, "rollPresets" as any, updated)
    }
}