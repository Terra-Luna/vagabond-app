import { useMemo } from "react"

export const useCanvasTokens = () => {
    const canvasTokens = useMemo(() => {
        if (!canvas || !canvas.tokens || !canvas.tokens.placeables) {
            return []
        }
        return canvas.tokens.placeables
    }, [canvas?.tokens?.placeables])

    return { canvasTokens }
}