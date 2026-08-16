import { useCallback } from "react"
import { RollPreset } from "../../model/RollPreset"

export const useSavePreset = (actor: Actor, preset: RollPreset) => {

    const savePreset = useCallback(async (closeApp: () => void) => {
        if (!preset) return

        const presets = [...actor.getFlag("vagabond-lite" as any, "rollPresets" as any) as RollPreset[] ?? []]

        const updated: RollPreset[] = presets.some(p => (p.title + p.description) === (preset.title + preset.description))
            ? [...presets.filter(it => (it.title + it.description) !== (preset.title + preset.description)), preset]
            : [...presets, preset]

        if (updated.length > 0) {
            await actor.setFlag("vagabond-lite" as any, "rollPresets" as any, updated)
        }

        closeApp()

    }, [actor, preset])

    const saveCustomRoll = useCallback(async () => {
        if (!preset) return
        await actor.setFlag("vagabond-lite" as any, "customRoll" as any, preset)
    }, [actor, preset])

    return { savePreset, saveCustomRoll }
}