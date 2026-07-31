import D20 from "../../../icons/dice/d20.svg?react"
import D12 from "../../../icons/dice/d12.svg?react"
import D10 from "../../../icons/dice/d10.svg?react"
import D8 from "../../../icons/dice/d8.svg?react"
import D6 from "../../../icons/dice/d6.svg?react"
import D4 from "../../../icons/dice/d4.svg?react"

export const DieIcon = ({ faces }: { faces: number, exploded: boolean }) => {
    const wh = `w-[1em] h-[1em]`
    const color = `var(--color-dice)`
    if (faces === 20) return <D20 className={wh} fill={color} />
    else if (faces === 12) return <D12 className={wh} fill={color} />
    else if (faces === 10) return <D10 className={wh} fill={color} />
    else if (faces === 8) return <D8 className={wh} fill={color} />
    else if (faces === 6) return <D6 className={wh} fill={color} />
    else if (faces === 4) return <D4 className={wh} fill={color} />
    else return <></>
}