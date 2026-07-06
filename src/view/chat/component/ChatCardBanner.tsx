import { getCanvasToken } from "../../../utils/modelUtil"
import { Divider } from "../../component/Header"
import { CardSubHeader, CardSubHeaderValues } from "../../component/SkillCard"

export const ChatCardBanner = ({ tokenId = '', portrait, title, subtitle = [] }: {
    tokenId?: string, portrait: string, title: string, subtitle?: CardSubHeaderValues[]
}) => {
    return (
        <div>
            <div className={`flex space-x-1 items-center bg-section-header-fill rounded-t-md px-1 font-eskapade font-bold`}>
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
            {
                subtitle.length === 0 ? <></> :
                    <CardSubHeader values={subtitle} showRightBorder={false} />
            }
        </div>
    )
}