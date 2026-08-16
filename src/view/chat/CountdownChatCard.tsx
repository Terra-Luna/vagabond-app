import { BaseChatCardHost } from "./component/BaseChatCardHost"
import { ChatCardBanner } from "./component/ChatCardBanner"
import { DiceRollComponent } from "./component/DiceRollComponent"
import { CountdownResult } from "../../combat/engine/roll/CountdownResult"

export const CountdownRollChatCard = ({ result }: { result: CountdownResult }) => {
    return (
        <BaseChatCardHost
            banner={<ChatCardBanner portrait={''} title={result.name} />}
            contents={<>
                <div className={`flex justify-center w-full`}>
                    <DiceRollComponent faces={result!.rollSummary!.faces} result={result!.rollSummary!.result} />
                </div>
                <p className="font-normal text-lg">{result.message}</p>
            </>}
        />
    )
}