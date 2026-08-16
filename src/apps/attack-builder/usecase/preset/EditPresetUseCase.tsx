import { useCallback } from "react"
import { RollBuilderApp } from "../../RollBuilderApp"
import { RollPreset } from "../../model/RollPreset"

export const useEditPreset = (actor: Actor) => {

    const editPreset = useCallback((preset: RollPreset) => {
        new RollBuilderApp(actor, preset).render({ force: true })
    }, [actor])

    return { editPreset }
}