import { useCallback } from "react";
import { AttackBuilderApp, AttackPreset } from "../../AttackBuilderApp";

export const useEditPreset = (actor: Actor) => {

    const editPreset = useCallback((preset: AttackPreset) => {
        new AttackBuilderApp(actor, preset).render({ force: true })
    }, [actor])

    return { editPreset }
}