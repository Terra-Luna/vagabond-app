import { getTokenImg } from "../../utils/modelUtil"
import { EnrichedContent } from "../component/EnrichedContent"
import { BaseChatCardHost } from "./component/BaseChatCardHost"
import { ChatCardBanner } from "./component/ChatCardBanner"
import { TargetsDisplay } from "./component/TargetsDisplay"

export const AbilityChatCard = ({ actorId, title, description, tokenIds }: { actorId: string, title: string, description: string, tokenIds: string[] }) => {
    const actor = game.actors?.get(actorId)
    return (
        <BaseChatCardHost
            banner={<ChatCardBanner portrait={getTokenImg(actor)} title={`${title}`} />}
            contents={
                <div className="space-x-2">
                    <TargetsDisplay tokenIds={tokenIds} />
                    <EnrichedContent content={description} />
                </div>
            }
        />
    )
}