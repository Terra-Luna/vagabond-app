import { rollCountdownDie } from "../../combat/dice-rolls"
import { getTokenImg } from "../../utils/modelUtil"
import { EnrichedContent } from "../component/EnrichedContent"
import { BaseChatCardHost } from "./component/BaseChatCardHost"
import { ChatCardBanner } from "./component/ChatCardBanner"
import { TargetsDisplay } from "./component/TargetsDisplay"
import { ImageWithDamageTypeBadge } from "../component/DamageTypeIcon"
import { vgLiteLang } from "../../utils/lang"
import { glowOnHover } from "../common/text-styles"
import { CardSubHeaderValues } from "../component/SkillCard"
import { sendCountdownRollMessage } from "./ChatCardSerializer"
import { CountdownRollChatCard } from "./CountdownChatCard"

export const AbilityChatCard = ({ actorId, img = '', title, subtitle = [], description, tokenIds = [], appliesBurn = false, burnDuration = '' }: {
    actorId: string | null,
    img?: string,
    title: string,
    subtitle?: CardSubHeaderValues[],
    description: string,
    tokenIds?: string[],
    appliesBurn?: boolean,
    burnDuration?: string
}) => {
    const actor = actorId !== null ? game.actors?.get(actorId) : null
    return (
        <BaseChatCardHost
            banner={<ChatCardBanner
                tokenId={actor?.getActiveTokens()[0]?.id}
                portrait={getTokenImg(actor)}
                title={title}
                subtitle={subtitle}
            />}
            contents={
                <div className="space-x-2 text-base text-text-secondary font-paradigm font-normal">
                    <TargetsDisplay tokenIds={tokenIds} />
                    <div>
                        {
                            !img || img === '' ? <></> :
                                <ImageWithDamageTypeBadge img={img} size={46} className="mr-2" />
                        }
                        <div className="text-justify">
                            <EnrichedContent content={description} />
                        </div>
                    </div>
                    {
                        appliesBurn ? <p
                            className={`${glowOnHover} cursor-pointer`}
                            onClick={async () => {
                                const cdRes = await rollCountdownDie({ name: title, duration: burnDuration })
                                sendCountdownRollMessage(cdRes, CountdownRollChatCard)
                            }}
                        >
                            {vgLiteLang.ItemSheet.burnDuration}: {burnDuration}
                        </p> : <></>
                    }
                </div>
            }
        />
    )
}