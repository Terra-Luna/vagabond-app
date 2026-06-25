import { Plus } from 'lucide-react'
import { DamageRollResult } from '../../combat/dice-rolls'
import { DamageTypeIcon } from '../component/DamageTypeIcon'
import { Divider } from '../component/Header'
import { BaseChatCardHost } from './BaseChatCardHost'
import { ChatCardBanner } from './ChatCardBanner'
import { DiceRoll } from './DiceRoll'

export const DamageRollCard = ({ portrait, targetIds, result }: { portrait: string, targetIds: string[], result: DamageRollResult }) => {
    return (
        <BaseChatCardHost
            banner={<ChatCardBanner portrait={portrait} title={result.atkName} />}
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
                                <Plus size={24} />
                                <p className="text-4xl">{result.bonus}</p>
                            </div>
                    }
                </div>
                <div className="w-fit">
                    <DamageTypeIcon dmgType={result.dmgType} size={24} />
                </div>
                <p>{result.total}</p>
            </>}
        />
    )
}

const Targets = ({ targetIds }: { targetIds: string[] }) => {
    const targets = targetIds.map(id => (
        { id: id, src: canvas?.tokens?.get(id)?.document.texture.src ?? '' }
    ))
    return (
        <div className="flex space-x-1 justify-center items-center">
            {
                targets.length > 0 ?
                    <>
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
                    </> : <></>
            }
        </div>
    )
}