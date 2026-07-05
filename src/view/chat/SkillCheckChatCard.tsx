import { SkillCheckResult } from '../../combat/dice-rolls'
import { Minus, Plus } from 'lucide-react'
import { DiceRoll } from './component/DiceRoll'
import { ChatCardBanner } from "./component/ChatCardBanner"
import { BaseChatCardHost } from "./component/BaseChatCardHost"
import { getTokenImg } from "../../utils/modelUtil"
import { vgLiteLang } from '../../utils/lang'

export const SkillCheckChatCard = ({ actorId, result }: { actorId: string, result: SkillCheckResult }) => {
    const actor = game.actors?.get(actorId)
    const [resultTextColor] = result.result === vgLiteLang.RollResult.failure ? ['text-failure'] : ['text-success']
    return (
        <BaseChatCardHost
            banner={<ChatCardBanner
                tokenId={actor?.getActiveTokens()[0]?.id}
                portrait={getTokenImg(actor)}
                title={`${result.skillName} Check`}
                subtitle={[{ label: "Difficulty", value: result.difficulty.toString() }]}
            />}
            contents={<>
                <DiceGraphics d20={result.d20} d6={result.d6} favHinder={result.favorHinder} />
                <TotalsFooter total={result.total} csf={result.result} resultTextColor={resultTextColor} />
            </>}
        />
    )
}

const DiceGraphics = ({ d20, d6, favHinder }) => {
    return (
        <div className="flex gap-x-2 mt-2 justify-center">
            <DiceRoll faces={20} result={d20} textSize="text-5xl" />
            {
                favHinder !== vgLiteLang.FavorHinder.none ?
                    <div className="flex gap-x-2">
                        <div className="h-full content-center">{
                            favHinder === vgLiteLang.FavorHinder.favor ?
                                <Plus size={24} strokeWidth={4} /> :
                                <Minus size={24} strokeWidth={4} />
                        }</div>
                        <div className="h-full content-center">
                            <DiceRoll faces={6} result={d6} textSize="text-4xl" />
                        </div>
                    </div> : <></>
            }
        </div>
    )
}

const TotalsFooter = ({ total, csf, resultTextColor }) => {
    return (
        <div className="flex mt-2 space-x-2 h-fit items-end">
            <p className="font-paradigm font-normal text-text-secondary">Total:</p>
            <p className="text-5xl mr-4">{total}</p>
            <p className={`${resultTextColor} text-xl ml-auto mr-2 [text-shadow:0_0_10px_var(--color-text-glow)]`}>{csf}</p>
        </div>
    )
}