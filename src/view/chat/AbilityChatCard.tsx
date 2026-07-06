import { Equal } from "lucide-react"
import { DamageRollResult, rollCountdownDie } from "../../combat/dice-rolls"
import { getTokenImg } from "../../utils/modelUtil"
import { EnrichedContent } from "../component/EnrichedContent"
import { BaseChatCardHost } from "./component/BaseChatCardHost"
import { ChatCardBanner } from "./component/ChatCardBanner"
import { DamageRolls } from "./component/DiceRoll"
import { TargetsDisplay } from "./component/TargetsDisplay"
import { DamageTypeIcon, ImageWithDamageTypeBadge } from "../component/DamageTypeIcon"
import { lang, vgLiteLang } from "../../utils/lang"
import { CountdownRollChatCard } from "./CountdownRollChatCard"
import { glowOnHover } from "../common/text-styles"
import { CardSubHeaderValues } from "../component/SkillCard"
import { sendVgLiteChatMessage } from "../../utils/chatMessageUtil"

export const AbilityChatCard = ({ actorId, img = '', title, subtitle = [], description, tokenIds = [], appliesBurn = false, burnDuration = '' }: {
    actorId: string,
    img?: string,
    title: string,
    subtitle?: CardSubHeaderValues[],
    description: string,
    tokenIds?: string[],
    appliesBurn?: boolean,
    burnDuration?: string
}) => {
    const actor = game.actors?.get(actorId)
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
                                sendVgLiteChatMessage(actor, <CountdownRollChatCard result={cdRes!} />, cdRes!.rolls)
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

export const ComboChatCard = ({ actorId, rolls, tokenIds }: { actorId: string, rolls: DamageRollResult[], tokenIds: string[] }) => {
    const actor = game.actors?.get(actorId)
    return (
        <BaseChatCardHost
            banner={<ChatCardBanner
                tokenId={actor?.getActiveTokens()[0]?.id}
                portrait={getTokenImg(actor)}
                title={lang.VGLITE.AdversarySheet.combo} />
            }
            contents={
                <div className="">
                    <TargetsDisplay tokenIds={tokenIds} />
                    {
                        rolls.map((roll, i) => (
                            <div key={i}>
                                <p>{roll.atkName}</p>
                                <div className="flex gap-x-4 justify-between items-center">
                                    <DamageRolls result={roll} />
                                    <Equal size={18} className="text-text-secondary" />
                                    <p className="text-4xl">{roll.total}</p>
                                    <DamageTypeIcon dmgType={roll.dmgType} />
                                </div>
                            </div>
                        ))
                    }
                </div >
            }
        />
    )
}