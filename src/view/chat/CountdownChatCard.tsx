import { useState } from "react"
import { CountdownResult, rollCountdownDie } from "../../combat/rules/dice-rolls"
import { BaseChatCardHost } from "./component/BaseChatCardHost"
import { ChatCardBanner } from "./component/ChatCardBanner"
import { DiceRoll } from "./component/DiceRoll"
import { sendCountdownRollMessage } from "./ChatCardSerializer"

export const CountdownRollChatCard = ({ result }: { result: CountdownResult }) => {
    const [isReRolled, setIsReRolled] = useState(false)
    return (
        <BaseChatCardHost
            banner={<ChatCardBanner portrait={''} title={result.name} />}
            contents={<>
                <div className={`flex justify-center w-full ${isReRolled ? '' : 'cursor-pointer'}`} onClick={async () => {
                    if (isReRolled) return
                    setIsReRolled(true)
                    const cdRes = await rollCountdownDie(result)
                    if (!cdRes) return
                    sendCountdownRollMessage(cdRes, CountdownRollChatCard)
                }}>
                    <DiceRoll faces={result!.rollSummary!.dieSize} result={result!.rollSummary!.result} />
                </div>
                <p className="font-normal text-lg">{result.message}</p>
            </>}
        />
    )
}

