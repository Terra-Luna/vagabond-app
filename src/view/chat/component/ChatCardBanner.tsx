import { ReactNode } from "react"

import { Divider } from "../../component/Header"
import { CardSubHeader, CardSubHeaderValues } from "../../component/SkillCard"
import { ChatCardPortrait } from "./ChatCardPortrait"

export const ChatCardBanner = ({ tokenId = '', portrait, title, subtitle = [] }: {
    tokenId?: string, portrait: string, title: string | ReactNode, subtitle?: CardSubHeaderValues[]
}) => {
    return (
        <div>
            <div className={`flex space-x-1 items-center bg-section-header-fill rounded-t-md px-1 font-eskapade font-bold min-h-[54px]`}>
                {portrait != null && portrait.length > 0 &&
                    <ChatCardPortrait portrait={portrait} tokenId={tokenId} />
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