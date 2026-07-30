import { getCanvasToken, getTokenImg } from "../../utils/modelUtil"
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
import { useState, useCallback } from "react"
import { CountdownRoll } from "../../combat/engine/CountdownRoll"

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

    const [targets, setTargets] = useState(tokenIds.map(id => (
        { id: id, src: getTokenImg(getCanvasToken(id)), token: getCanvasToken(id) }
    )).filter(it => it.src != null && it.src.length > 0))

    const onRemoveTarget = useCallback((targetIndex) => {
        setTargets(targets.filter((_, i) => i !== targetIndex))
    }, [targets])

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
                    <TargetsDisplay targets={targets} onRemoveTarget={onRemoveTarget} />
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
                            className={`${glowOnHover}`}
                            onClick={async () => {
                                const cdRes = await new CountdownRoll({ name: title, duration: burnDuration }).roll()
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