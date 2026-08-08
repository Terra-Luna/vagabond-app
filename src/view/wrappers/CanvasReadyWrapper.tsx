import { useIsCanvasReady } from "./hooks"

export const CanvasReadyWrapper = ({ children }) => {
    const isCanvasReady = useIsCanvasReady()
    return isCanvasReady ? children : undefined
}