import { useCallback } from "react"
import { AttackPreset } from "../../AttackBuilderApp"

export const useSavePreset = (actor: Actor, preset: AttackPreset) => {

    const savePreset = useCallback(async (closeApp: () => void) => {
        if (!preset || !preset.title) return

        const presets = [...actor.getFlag("vagabond-lite" as any, "attackPresets" as any) as AttackPreset[] ?? []]

        const updated: AttackPreset[] = presets.some(p => p.title === preset.title)
            ? [...presets.filter(it => it.title !== preset.title), preset]
            : [...presets, preset]

        if (updated.length > 0) {
            await actor.setFlag("vagabond-lite" as any, "attackPresets" as any, updated)
        }

        closeApp()

    }, [actor, preset])

    return { savePreset }
}