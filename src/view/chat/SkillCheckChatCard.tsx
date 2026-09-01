import { Minus, Plus } from 'lucide-react'

import { SkillCheckResult } from '../../combat/engine/roll/SkillCheck'
import { vgLiteLang } from '../../utils/lang'
import { getTokenImg } from "../../utils/modelUtil"
import { BaseChatCardHost } from "./component/BaseChatCardHost"
import { ChatCardBanner } from "./component/ChatCardBanner"
import { DiceRollComponent } from './component/DiceRollComponent'

export const SkillCheckChatCard = ({ actorId, result }: { actorId: string, result: SkillCheckResult }) => {
    const actor = game.actors?.get(actorId)

    return (
        <BaseChatCardHost
            banner={<ChatCardBanner
                tokenId={actor?.getActiveTokens()[0]?.id}
                portrait={getTokenImg(actor)}
                title={`${vgLiteLang.Skills[result.skill]?.name ?? vgLiteLang.Saves[result.skill]?.name} ${result.blockDie > 0 ? '(Defensive) ' : ''}Check`}
                subtitle={[
                    { label: "Difficulty", value: result.difficulty.toString() },
                    { label: "Result", value: result.outcome }
                ]}
            />}
            contents={<>
                <SkillCheckDiceComponent
                    d20s={result.d20s}
                    d6={result.d6}
                    modifier={result.modifier}
                    favHinder={result.favorHinder}
                    blockDie={result.blockDie}
                    bonusDice={result.bonusDice}
                />
            </>}
        />
    )
}

export const SkillCheckDiceComponent = ({ d20s, d6, modifier, favHinder, blockDie = 0, bonusDice }) => {
    return (
        <div className="flex gap-x-1 mt-2 justify-center items-center">
            {/* D20 DICE ARRAY */}
            {d20s.map((d20: number, index: number) => (
                <DiceRollComponent key={index} faces={blockDie > 0 ? blockDie : 20} result={d20} discarded={index < d20s.length - 1} textSize="text-5xl" />
            ))}
            {/* FAVOR/HINDER DICE */}
            {favHinder !== 'none' &&
                <div className="flex">
                    <div className="h-full content-center">{
                        favHinder === 'favor'
                            ? <Plus size={24} strokeWidth={2} />
                            : <Minus size={24} strokeWidth={2} />
                    }</div>
                    <div className="h-full content-center">
                        <DiceRollComponent faces={6} result={d6} textSize="text-4xl" />
                    </div>
                </div>
            }

            {/* BONUS DICE */}
            {bonusDice?.map((bonusDie, index) => (
                <div className="flex items-center" key={index}>
                    <Plus size={24} strokeWidth={2} />
                    <DiceRollComponent key={index} faces={bonusDie.faces} result={bonusDie.result} textSize="text-4xl" />
                </div>
            ))}

            {/* MODIFIER */}
            {modifier !== 0 &&
                <div className="flex items-center">
                    <div className="h-full content-center">{
                        modifier > 0
                            ? <Plus size={22} strokeWidth={2} />
                            : <Minus size={22} strokeWidth={2} />
                    }</div>
                    <p className="text-3xl">{Math.abs(modifier)}</p>
                </div>
            }
        </div>
    )
}