import { useCallback } from "react";
import { AttackPreset } from "../../AttackBuilderApp";

export const useDeletePreset = (actor: Actor) => {

    const deletePreset = useCallback(async (index: number) => {
        const presets = [...actor.getFlag("vagabond-lite" as any, "attackPresets" as any) as AttackPreset[] ?? []]
        await actor.setFlag("vagabond-lite" as any, "attackPresets", presets.filter((_, pIdx) => pIdx !== index))
    }, [actor])

    return { deletePreset }
}