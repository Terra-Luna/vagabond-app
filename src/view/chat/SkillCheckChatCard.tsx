import { Minus, Plus } from 'lucide-react'
import { DiceRollComponent } from './component/DiceRollComponent'
import { ChatCardBanner } from "./component/ChatCardBanner"
import { BaseChatCardHost } from "./component/BaseChatCardHost"
import { getTokenImg } from "../../utils/modelUtil"
import { vgLiteLang } from '../../utils/lang'
import { SkillCheckResult } from '../../combat/engine/SkillCheck'

export const SkillCheckChatCard = ({ actorId, result }: { actorId: string, result: SkillCheckResult }) => {
    const actor = game.actors?.get(actorId)

    return (
        <BaseChatCardHost
            banner={<ChatCardBanner
                tokenId={actor?.getActiveTokens()[0]?.id}
                portrait={getTokenImg(actor)}
                title={`${vgLiteLang.Skills[result.skill]?.name ?? vgLiteLang.Saves[result.skill]?.name} Check`}
                subtitle={[
                    { label: "Difficulty", value: result.difficulty.toString() },
                    { label: "Result", value: result.outcome }
                ]}
            />}
            contents={<>
                <SkillCheckDiceComponent d20={result.d20} d6={result.d6} favHinder={result.favorHinder} />
            </>}
        />
    )
}

export const SkillCheckDiceComponent = ({ d20, d6, favHinder }) => {
    return (
        <div className="flex mt-2 justify-center">
            <DiceRollComponent faces={20} result={d20} textSize="text-5xl" />
            {favHinder !== 'none' &&
                <div className="flex">
                    <div className="h-full content-center">{
                        favHinder === 'favor' ?
                            <Plus size={24} strokeWidth={4} /> :
                            <Minus size={24} strokeWidth={4} />
                    }</div>
                    <div className="h-full content-center">
                        <DiceRollComponent faces={6} result={d6} textSize="text-4xl" />
                    </div>
                </div>
            }
        </div>
    )
}