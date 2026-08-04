import { getCanvasToken } from "../../../utils/modelUtil"

export const ChatCardPortrait = ({ tokenId, portrait, size = 54 }: {
    tokenId: string | undefined | null, portrait: string, size?: number
}) => {
    return (
        <img
            className={`object-contain p-0.5 cursor-pointer`} src={portrait} alt={''}
            style={{ height: `${size}px`, width: `${size}px` }}
            onClick={() => {
                if (!tokenId || tokenId === '') return
                const token = getCanvasToken(tokenId)
                token?.control({ releaseOthers: true })
                canvas?.animatePan({ x: token?.center.x, y: token?.center.y })
            }}
        />
    )
}