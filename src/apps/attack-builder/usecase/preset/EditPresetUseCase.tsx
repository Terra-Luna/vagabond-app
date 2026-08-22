import { useCallback } from "react"

import { RollPreset } from "../../model/RollPreset"
import { RollBuilderApp } from "../../RollBuilderApp"

export const useEditPreset = (actor: Actor) => {

    const editPreset = useCallback((preset: RollPreset) => {
        new RollBuilderApp(actor, preset).render({ force: true })
    }, [actor])

    return { editPreset }
}