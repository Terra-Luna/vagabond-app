import { useCallback } from "react"

import { sys_id } from "../../../../utils/foundryUtils"
import { RollPreset } from "../../model/RollPreset"

export const useSavePreset = (actor: Actor, preset: RollPreset) => {

    const savePreset = useCallback(async (closeApp: () => void) => {
        if (!preset) return

        const presets = [...actor.getFlag(sys_id, "rollPresets" as any) as RollPreset[] ?? []]

        const updated: RollPreset[] = presets.some(p => (p.title + p.description) === (preset.title + preset.description))
            ? [...presets.filter(it => (it.title + it.description) !== (preset.title + preset.description)), preset]
            : [...presets, preset]

        if (updated.length > 0) {
            await actor.setFlag(sys_id, "rollPresets" as any, updated)
        }

        closeApp()

    }, [actor, preset])

    const saveCustomRoll = useCallback(async () => {
        if (!preset) return
        await actor.setFlag(sys_id, "customRoll" as any, preset)
    }, [actor, preset])

    return { savePreset, saveCustomRoll }
}