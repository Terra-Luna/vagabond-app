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