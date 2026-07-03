import D20 from "../../../../public/assets/icons/dice/d20.svg?react"
import D12 from "../../../../public/assets/icons/dice/d12.svg?react"
import D10 from "../../../../public/assets/icons/dice/d10.svg?react"
import D8 from "../../../../public/assets/icons/dice/d8.svg?react"
import D6 from "../../../../public/assets/icons/dice/d6.svg?react"
import D4 from "../../../../public/assets/icons/dice/d4.svg?react"
import { DamageRollResult } from "../../../combat/dice-rolls"
import { Plus } from "lucide-react"


const centeredAlignment = "absolute flex items-center justify-center top-1/2 right-1/2 transform translate-x-1/2 -translate-y-1/2"

export const DamageRolls = ({ result }: { result: DamageRollResult }) => {
    return (
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
                    <div className="flex space-x-2">
                        <div className="h-full content-center text-text-secondary"><Plus size={24} /></div>
                        <p className="h-full conent center text-4xl">{result.bonus}</p>
                    </div>
            }
        </div>
    )
}

export const DiceRoll = ({ faces, result, textSize = "text-4xl", exploded = false }: {
    faces: number,
    result: number,
    textSize?: string,
    exploded?: boolean
}) => {
    return (
        <div className={`relative ${textSize}`}>
            <div className="relative inline-flex items-center justify-center">
                <DieIcon faces={faces} exploded={exploded} />
                <p className={`${centeredAlignment} text-[0.8em] text-text-section-header h-[1em] w-[1em]`}>
                    {result}
                </p>
            </div>
        </div>
    )
}

const DieIcon = ({ faces }: { faces: number, exploded: boolean }) => {
    const steez = `w-[1em] h-[1em]`
    const color = `var(--color-section-header-fill)`
    if (faces === 20) return <D20 className={steez} fill={color} />
    else if (faces === 12) return <D12 className={steez} fill={color} />
    else if (faces === 10) return <D10 className={steez} fill={color} />
    else if (faces === 8) return <D8 className={steez} fill={color} />
    else if (faces === 6) return <D6 className={steez} fill={color} />
    else if (faces === 4) return <D4 className={steez} fill={color} />
    else return <></>
}