import { getCanvasToken } from "../../../utils/modelUtil"

export const ChatCardPortrait = ({ tokenId, portrait, size = 54 }: {
    tokenId: string | undefined | null, portrait: string, size?: number
}) => {
    const token = getCanvasToken(tokenId) 

    return (
        <img
            className={`object-contain p-0.5 cursor-pointer`} src={portrait} alt={''}
            title={token?.name}
            style={{ height: `${size}px`, width: `${size}px` }}
            onClick={() => {
                if (!tokenId || tokenId === '') return
                token?.control({ releaseOthers: true })
                canvas?.animatePan({ x: token?.center.x, y: token?.center.y })
            }}
        />
    )
}