import { getCanvasToken } from "../../../utils/modelUtil"
import { Divider } from "../../component/Header"

export const ChatCardBanner = ({ tokenId = '', portrait, title }: { tokenId?: string, portrait: string, title: string }) => {
    return (
        <div className={`flex space-x-1 items-center bg-section-header-fill px-1 rounded-t-md font-eskapade font-bold`}>
            {portrait == null || portrait.length === 0 ? <></> :
                <img
                    className="object-contain h-[54px] w-[54px] p-0.5 cursor-pointer" src={portrait} alt={''}
                    onClick={() => {
                        if (!tokenId || tokenId === '') return
                        const token = getCanvasToken(tokenId)
                        token?.control({ releaseOthers: true })
                        canvas?.animatePan({ x: token?.center.x, y: token?.center.y })
                    }}
                />
            }
            <div className="flex w-full items-center text-text-section-header">
                <div className="text-xl mr-1">{title}</div>
                <Divider />
            </div>
        </div>
    )
}