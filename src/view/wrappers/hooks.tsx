import { useEffect, useState } from "react"

export const useIsCanvasReady = () => {
    const [isCanvasReady, setIsCanvasReady] = useState(game.canvas?.initialized)

    useEffect(() => {
        const hookId = Hooks.on("canvasReady", () => {
            setIsCanvasReady(true)
        })

        return () => Hooks.off("canvasReady", hookId)
    }, [])

    return isCanvasReady
}

/** The foundry types repo has their overloads in the "wrong" order and has the deprecated one last, so the Parameters built-in thinks we can only use the deprecated ones. Ugh. Just use "as any" when you call this */
export const useFoundryHook = (...args: Parameters<typeof Hooks.on>) => {
    useEffect(() => {
        const hookId = Hooks.on(...args)
        return () => Hooks.off(args[0], hookId)
    }, [])
}