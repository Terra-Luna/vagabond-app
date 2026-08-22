import { useCallback } from "react"

import { RollPreset } from "../../model/RollPreset"

export const useDeletePreset = (actor: Actor) => {

    const deletePreset = useCallback(async (index: number) => {
        const presets = [...actor.getFlag("vagabond-lite" as any, "rollPresets" as any) as RollPreset[] ?? []]
        await actor.setFlag("vagabond-lite" as any, "rollPresets", presets.filter((_, pIdx) => pIdx !== index))
    }, [actor])

    return { deletePreset }
}