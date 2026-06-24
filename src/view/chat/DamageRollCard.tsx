import { DamageRollResult } from '../../combat/dice-rolls'
import { BaseChatCardHost } from './BaseChatCardHost'
import { ChatCardBanner } from './ChatCardBanner'

export const DamageRollCard = ({ portrait, result }: { portrait: string, result: DamageRollResult }) => {
    return (
        <BaseChatCardHost
            banner={<ChatCardBanner portrait={portrait} title={result.atkName} />}
            contents={<>
                {
                    result.rollsSummary.map(r => (
                        <p>[{r.dieSize}] {r.result} {r.exploded}</p>
                    ))
                }
                <p> + {result.bonus}</p>
                <p>{result.total}</p>
            </>}
        />
    )
}