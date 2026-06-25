// @ts-ignore
import D20 from "../../../public/assets/icons/dice/d20.svg?react"
// @ts-ignore
import D12 from "../../../public/assets/icons/dice/d12.svg?react"
// @ts-ignore
import D10 from "../../../public/assets/icons/dice/d10.svg?react"
// @ts-ignore
import D8 from "../../../public/assets/icons/dice/d8.svg?react"
// @ts-ignore
import D6 from "../../../public/assets/icons/dice/d6.svg?react"
// @ts-ignore
import D4 from "../../../public/assets/icons/dice/d4.svg?react"


const centeredAlignment = "absolute flex items-center justify-center top-1/2 right-1/2 transform translate-x-1/2 -translate-y-1/2"

export const DiceRoll = ({ faces, result, textSize = "text-4xl", exploded = false }: { faces: number, result: number, textSize?: string, exploded?: boolean }) => {
    return (
        <div className={`relative ${textSize}`}>
            <div className="relative inline-flex items-center justify-center">
                <DieIcon faces={faces} />
                <p className={`${centeredAlignment} text-[0.8em] text-text-section-header h-[1em] w-[1em]`}>
                    {result}
                </p>
            </div>
        </div>
    )
}

const DieIcon = ({ faces }: { faces: number }) => {
    const steez = `w-[1em] h-[1em]`
    if (faces === 20) return <D20 className={steez} fill={'var(--color-section-header-fill'} />
    else if (faces === 12) return <D12 className={steez} fill={'var(--color-section-header-fill'} />
    else if (faces === 10) return <D10 className={steez} fill={'var(--color-section-header-fill'} />
    else if (faces === 8) return <D8 className={steez} fill={'var(--color-section-header-fill'} />
    else if (faces === 6) return <D6 className={steez} fill={'var(--color-section-header-fill'} />
    else if (faces === 4) return <D4 className={steez} fill={'var(--color-section-header-fill'} />
    else return <></>
}