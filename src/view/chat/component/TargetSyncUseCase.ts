import { useEffect, useState } from "react"

import { TargetDisplayItem } from "../../../combat/ui/hooks"
import { getCanvasToken, getTargets, getTokenImg } from "../../../utils/modelUtil"

const readCanvasTargets = (): TargetDisplayItem[] => getTargets()
    .map(t => {
        const token = getCanvasToken(t.id)
        return { id: t.id, src: getTokenImg(token), token }
    })
    .filter(it => it.src != null && it.src.length > 0)

/**
 * Live-tracks the current user's canvas targets. Pair with TargetsDisplay component for a good time.
 */
export const useTargetSync = (): TargetDisplayItem[] => {
    const [targets, setTargets] = useState<TargetDisplayItem[]>(readCanvasTargets)

    useEffect(() => {
        const hookId = Hooks.on("targetToken", (user: User) => {
            if (user.id === game.user?.id) setTargets(readCanvasTargets())
        })
        setTargets(readCanvasTargets())
        return () => Hooks.off("targetToken", hookId)
    }, [])

    return targets
}