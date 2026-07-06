import { Equal } from "lucide-react"
import { DamageRollResult } from "../../combat/dice-rolls"
import { lang } from "../../utils/lang"
import { getTokenImg } from "../../utils/modelUtil"
import { DamageTypeIcon } from "../component/DamageTypeIcon"
import { BaseChatCardHost } from "./component/BaseChatCardHost"
import { ChatCardBanner } from "./component/ChatCardBanner"
import { TargetsDisplay } from "./component/TargetsDisplay"
import { DamageRolls } from "./component/DamageRolls"

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