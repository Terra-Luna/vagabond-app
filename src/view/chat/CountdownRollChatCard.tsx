import { CountdownResult, rollCountdownDie } from "../../combat/dice-rolls"
import { glowOnHover } from "../common/text-styles"
import { sendVgLiteChatMessage } from "./ChatCardManager"
import { BaseChatCardHost } from "./component/BaseChatCardHost"
import { ChatCardBanner } from "./component/ChatCardBanner"
import { DiceRoll } from "./component/DiceRoll"

export const CountdownRollChatCard = ({ result }: { result: CountdownResult }) => {
    return (
        <BaseChatCardHost
            banner={<ChatCardBanner portrait={''} title={result.name} />}
            contents={<>
                <div className={`flex justify-center w-full ${glowOnHover} cursor-pointer`} onClick={async () => {
                    const cdRes = await rollCountdownDie(result)
                    if (!cdRes) return
                    sendVgLiteChatMessage(null, <CountdownRollChatCard result={cdRes} />, cdRes.rolls)
                }}>
                    <DiceRoll faces={result!.rollSummary!.dieSize} result={result!.rollSummary!.result} />
                </div>
                <p className="font-normal text-lg">{result.message}</p>
            </>}
        />
    )
}