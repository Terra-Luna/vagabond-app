import { DamageRollResult } from '../../combat/dice-rolls'
import { ChatCardBanner } from './ChatCardBanner'

export const DamageRollCard = ({ portrait, result }: { portrait: string, result: DamageRollResult }) => {
    return (
        <div>
            <ChatCardBanner portrait={portrait} title={result.atkName} />
            <p>{result.atkName}</p>
            {
                result.rollsSummary?.map(r => (
                    <p>[{r.dieSize}] {r.result} {r.exploded}</p>
                ))
            }
            <p> + {result.bonus}</p>
            <p>{result.total}</p>
        </div>
    )
}