import { Plus } from 'lucide-react'
import { DamageRollResult } from '../../combat/dice-rolls'
import { DamageTypeIcon } from '../component/DamageTypeIcon'
import { Divider } from '../component/Header'
import { BaseChatCardHost } from './component/BaseChatCardHost'
import { ChatCardBanner } from './component/ChatCardBanner'
import { DiceRoll } from './component/DiceRoll'
import { getCanvasToken, getTokenImg } from '../../utils/modelUtil'

export const DamageRollCard = ({ actorId, targetIds, result }: { actorId: string, targetIds: string[], result: DamageRollResult }) => {
    const actor = game.actors?.get(actorId)
    return (
        <BaseChatCardHost
            banner={<ChatCardBanner portrait={getTokenImg(actor)} title={result.atkName} />}
            contents={<>
                <Targets targetIds={targetIds} />
                <div className="flex flex-wrap grow gap-x-2 mt-2 justify-center">
                    {
                        result.rollsSummary.map((r, index) => (
                            <div key={index}>
                                <DiceRoll faces={r.dieSize} result={r.result} textSize={"text-4xl"} exploded={r.exploded} />
                            </div>
                        ))
                    }
                    {
                        result.bonus === 0 ? <></> :
                            <div className="flex">
                                <div className="h-full content-center"><Plus size={24} /></div>
                                <p className="h-full conent center text-4xl">{result.bonus}</p>
                            </div>
                    }
                </div>
                <div className="flex">
                    <p className="text-3xl text-text-primary">{result.total}</p>
                    <div className="w-fit">
                        <DamageTypeIcon dmgType={result.dmgType} size={24} />
                    </div>
                </div>
            </>}
        />
    )
}

const Targets = ({ targetIds }: { targetIds: string[] }) => {
    const targets = targetIds.map(id => (
        { id: id, src: getTokenImg(getCanvasToken(id)) }
    ))
    console.log(targetIds)
    return (
        <div className="flex space-x-1 justify-center items-center">
            {<>
                <Divider />
                {targets.filter(it => it.src != null && it.src.length > 0).map(target => (
                    <img
                        key={target.id}
                        className={`object-contain h-[32px] w-[32px]`}
                        src={target.src}
                        alt={'target'}
                    />
                ))}
                <Divider />
            </>}
        </div>
    )
}