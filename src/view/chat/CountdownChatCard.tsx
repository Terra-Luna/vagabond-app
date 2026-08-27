import { useState } from "react"

import { CountdownResult } from "../../combat/engine/roll/CountdownResult"
import { UtilityButton } from "../component/Button"
import { DamageTypeIcon } from "../component/DamageTypeIcon"
import { Header } from "../component/Header"
import { BaseChatCardHost } from "./component/BaseChatCardHost"
import { ChatCardBanner } from "./component/ChatCardBanner"
import { DiceRollComponent } from "./component/DiceRollComponent"

export const CountdownRollChatCard = ({ result }: { result: CountdownResult }) => {

    const [isApplied, setIsApplied] = useState(false)
    const dmgType = result.damageType

    const apply = async () => {
        if (!result.actorId && !result.tokenUuid || !dmgType) return

        const token = game.canvas?.tokens?.get(result.tokenUuid?.split(".").pop() ?? '') as any
        if (!token) return

        const roll = result.rollSummary?.result ?? 0

        if (dmgType === 'mana') {
            const mana = token.actor?.system?.mana?.current ?? 0
            token?.actor?.update({ "system.mana.current": mana + result } as Record<string, number>)
        }
        else {
            const hp = token.actor?.system?.health?.current ?? 0
            token?.actor?.update({ "system.health.current": hp - roll * (dmgType === 'healing' ? -1 : 1) } as Record<string, number>)
        }

        setIsApplied(true)
    }

    return (
        <BaseChatCardHost
            banner={<ChatCardBanner portrait={''} title={result.name} />}
            contents={<>
                <div className={`flex justify-center w-full`}>
                    <DiceRollComponent faces={result!.rollSummary!.faces} result={result!.rollSummary!.result} />
                    {dmgType &&
                        <div className="ml-2">
                            <DamageTypeIcon dmgType={dmgType} size={32} />
                        </div>
                    }
                </div>

                <p className="font-normal text-lg">{result.message}</p>

                {game.user?.isGM && result.duration > 0 && dmgType && !isApplied &&
                    <div className="flex flex-col gap-1">
                        <Header title={"GM TOOLS"} />
                        <UtilityButton onClick={() => apply()}>Apply</UtilityButton>
                    </div>
                }
            </>}
        />
    )
}