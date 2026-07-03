import { BookMarked, Clover } from "lucide-react"
import { getTokenImg } from "../../utils/modelUtil"
import { BaseChatCardHost } from "./component/BaseChatCardHost"
import { ChatCardBanner } from "./component/ChatCardBanner"
import ReactHtmlParser from 'react-html-parser'
import { lang } from "../../utils/lang"

const resources = lang.VGLITE.Resources

export const TrackerUpdateChatCard = ({ heroId, verb, resource }: { heroId: string, verb: string, resource: string }) => {
    const hero = game.actors?.get(heroId)
    const res = resources[resource]
    return (
        <BaseChatCardHost
            banner={<ChatCardBanner portrait={getTokenImg(hero)} title={`${verb} ${res.name}`} />}
            contents={
                <div className="text-sm text-justify font-paradigm font-normal">
                    <TrackerIcon resource={resource} />
                    {ReactHtmlParser(res.description)}
                </div>
            }
        />
    )
}

/**
 * TODO: find a way to embed the icon name+color into the Resources obj
 *       and dynamically build the Lucide icon here rather than mapping.
 * @param param0 
 * @returns 
 */
const TrackerIcon = ({ resource }: { resource: string }) => {
    const size = 34
    const layout = "float-left mr-1"
    return (<>
        {
            resource === 'luck' ?
                <Clover size={size} strokeWidth={1} className={`text-ic-luck ${layout}`} /> : (
                    resource === 'studied' ?
                        <BookMarked size={size} strokeWidth={1} className={`text-ic-studied ${layout}`} /> : <></>
                )
        }
    </>)
}