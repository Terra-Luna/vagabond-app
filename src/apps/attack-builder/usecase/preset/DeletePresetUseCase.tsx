import { useCallback } from "react"

import { sys_id } from "../../../../utils/foundryUtils"
import { RollPreset } from "../../model/RollPreset"

export const useDeletePreset = (actor: Actor) => {

    const deletePreset = useCallback(async (index: number) => {
        const presets = [...actor.getFlag(sys_id, "rollPresets" as any) as RollPreset[] ?? []]
        await actor.setFlag(sys_id, "rollPresets", presets.filter((_, pIdx) => pIdx !== index))
    }, [actor])

    return { deletePreset }
}