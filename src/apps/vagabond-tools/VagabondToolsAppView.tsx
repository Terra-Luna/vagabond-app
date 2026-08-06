import { useCanvasTokens } from "./usecase/CanvasTokensUseCase"

export const VagabondToolsAppView = () => {

    const { canvasTokens } = useCanvasTokens()

    return (
        <div className="bg-sheet-main-fill">
            {canvasTokens.map(t => (
                <p>{t.name}</p>
            ))}
        </div>
    )
}