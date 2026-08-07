import { lang } from "../../utils/lang"
import { getCanvasToken, getTargets, getTokenImg } from "../../utils/modelUtil"
import { DamageTypeIcon } from "../component/DamageTypeIcon"
import { BaseChatCardHost } from "./component/BaseChatCardHost"
import { ChatCardBanner } from "./component/ChatCardBanner"
import { TargetsDisplay } from "./component/TargetsDisplay"
import { DamageRollsComponent } from "./component/DamageRollsComponent"
import { DamageRollResult } from "../../combat/engine/DamageRoll"
import { useCallback, useState } from "react"

export const ComboChatCard = ({ actorId, rolls, tokenIds }: { actorId: string, rolls: DamageRollResult[], tokenIds: string[] }) => {
    const actor = game.actors?.get(actorId)

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
                title={lang.VGLITE.AdversarySheet.combo} />
            }
            contents={
                <div>
                    <TargetsDisplay targets={targets} onRemoveTarget={onRemoveTarget} />
                    {
                        rolls.map((roll, i) => (
                            <div key={i}>
                                <p>{roll.atkName}</p>
                                <div className="flex flex-col gap-x-4 justify-between items-center">
                                    <DamageRollsComponent result={roll} />
                                    <div className="flex gap-x-1 items-center">
                                        <p className="text-xl font-paradigm font-normal">Total:</p>
                                        <p className="text-4xl">{roll.total}</p>
                                        <DamageTypeIcon dmgType={roll.dmgType} />
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                </div >
            }
        />
    )
}