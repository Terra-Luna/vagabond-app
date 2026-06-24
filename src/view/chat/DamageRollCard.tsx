import { DamageRollResult } from '../../combat/dice-rolls'

export const DamageRollCard = ({ portrait, result }: { portrait: string, result: DamageRollResult }) => {
    return (
        <div>
            <p>{result.atkName}</p>
            {
                result.rollsSummary.map(r => (
                    <p>[{r.dieSize}] {r.result} {r.exploded}</p>
                ))
            }
            <p> + {result.bonus}</p>
            <p>{result.total}</p>
        </div>
    )
}