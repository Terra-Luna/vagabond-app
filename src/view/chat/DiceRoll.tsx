// @ts-ignore
import D20 from "../../../public/assets/icons/dice/d20-blank.svg?react"
// @ts-ignore
import D12 from "../../../public/assets/icons/dice/d12-blank.svg?react"
// @ts-ignore
import D10 from "../../../public/assets/icons/dice/d10-blank.svg?react"
// @ts-ignore
import D8 from "../../../public/assets/icons/dice/d8-blank.svg?react"
// @ts-ignore
import D6 from "../../../public/assets/icons/dice/d6-blank.svg?react"
// @ts-ignore
import D4 from "../../../public/assets/icons/dice/d4-blank.svg?react"

const centeredAlignment = "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
const textStyle = "text-2xl text-center font-eskapade font-bold"
const textBg = "bg-sheet-main-fill rounded-full p-0.5"

export const DiceRoll = ({ faces, result, exploded = false }: { faces: number, result: number, exploded?: boolean }) => {
    return (
        <div className="relative w-[56px] h-[56px]">
            <DieIcon faces={faces} size={56} />
            <div className={`${centeredAlignment} ${textStyle} ${textBg}`}>
                {result}
            </div>
        </div>
    )
}

const DieIcon = ({ faces, size }: { faces: number, size: number }) => {
    const steez = `h-[${size}px] w-[${size}px] fill-text-secondary stroke-text-secondary stroke-1`
    if (faces === 20) return <D20 className={steez} />
    else if (faces === 12) return <D12 className={steez} />
    else if (faces === 10) return <D10 className={steez} />
    else if (faces === 8) return <D8 className={steez} />
    else if (faces === 6) return <D6 className={steez} />
    else if (faces === 4) return <D4 className={steez} />
    else return <></>
}