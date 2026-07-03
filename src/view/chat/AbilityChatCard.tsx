import { Equal } from "lucide-react"
import { DamageRollResult } from "../../combat/dice-rolls"
import { getTokenImg } from "../../utils/modelUtil"
import { EnrichedContent } from "../component/EnrichedContent"
import { BaseChatCardHost } from "./component/BaseChatCardHost"
import { ChatCardBanner } from "./component/ChatCardBanner"
import { DamageRolls } from "./component/DiceRoll"
import { TargetsDisplay } from "./component/TargetsDisplay"
import { DamageTypeIcon } from "../component/DamageTypeIcon"
import { lang } from "../../utils/lang"

export const AbilityChatCard = ({ actorId, title, description, tokenIds, dmgType = 'none' }: {
    actorId: string, title: string, description: string, tokenIds: string[], dmgType?: string
}) => {
    const actor = game.actors?.get(actorId)
    return (
        <BaseChatCardHost
            banner={<ChatCardBanner portrait={getTokenImg(actor)} title={title} />}
            contents={
                <div className="space-x-2 text-base text-text-secondary font-paradigm font-normal">
                    <TargetsDisplay tokenIds={tokenIds} />
                    {
                        dmgType !== 'none' ? <div className="float-left mr-1"><DamageTypeIcon dmgType={dmgType} size={24} /></div> : <></>
                    }
                    <EnrichedContent content={description} />
                </div>
            }
        />
    )
}

export const ComboChatCard = ({ actorId, rolls, tokenIds }: { actorId: string, rolls: DamageRollResult[], tokenIds: string[] }) => {
    const actor = game.actors?.get(actorId)
    return (
        <BaseChatCardHost
            banner={<ChatCardBanner portrait={getTokenImg(actor)} title={lang.VGLITE.AdversarySheet.combo} />}
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