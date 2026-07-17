import { BookMarked, Clover } from "lucide-react"
import { getTokenImg } from "../../utils/modelUtil"
import { BaseChatCardHost } from "./component/BaseChatCardHost"
import { ChatCardBanner } from "./component/ChatCardBanner"
import ReactHtmlParser from 'react-html-parser'
import { lang } from "../../utils/lang"
import { CardSubHeaderValues } from "../component/SkillCard"

export const TrackerUpdateChatCard = ({ heroId, verb, resource }: { heroId: string, verb: string, resource: string }) => {
    const resources = lang.VGLITE.Resources
    const hero = game.actors?.get(heroId) as Actor & {
        system: { statuses: { counters: { luck: string, studied: string, fatigue: string } } }
    }
    if (!hero) return

    const res = resources[resource]
    const remaining = resource === 'luck' ?
        hero.system.statuses.counters.luck : (
            resource === 'studied' ?
                hero.system.statuses.counters.studied : ''
        )
    const subtitle: CardSubHeaderValues[] = []
    subtitle.push({ label: `${res.name} Remaining`, value: remaining.toString() })

    return (
        <BaseChatCardHost
            banner={<ChatCardBanner
                tokenId={hero?.getActiveTokens()[0]?.id}
                portrait={getTokenImg(hero)}
                title={`${verb} ${res.name}`}
                subtitle={subtitle}
            />}
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