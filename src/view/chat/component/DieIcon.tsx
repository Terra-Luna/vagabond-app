import D20 from "../../../icons/dice/d20.svg?react"
import D12 from "../../../icons/dice/d12.svg?react"
import D10 from "../../../icons/dice/d10.svg?react"
import D8 from "../../../icons/dice/d8.svg?react"
import D6 from "../../../icons/dice/d6.svg?react"
import D4 from "../../../icons/dice/d4.svg?react"

export const DieIcon = ({ faces, exploded, discarded }: { faces: number, exploded: boolean, discarded: boolean }) => {
    const wh = `w-[1em] h-[1em]`
    const color = `var(--color-dice)`

    const getDieSizeIcon = () => {
        if (faces === 20) return <D20 className={wh} fill={color} />
        else if (faces === 12) return <D12 className={wh} fill={color} />
        else if (faces === 10) return <D10 className={wh} fill={color} />
        else if (faces === 8) return <D8 className={wh} fill={color} />
        else if (faces === 6) return <D6 className={wh} fill={color} />
        else if (faces === 4) return <D4 className={wh} fill={color} />
        else return <></>
    }

    return (
        <div className="relative">
            {/* Explosion Background Layer */}
            {exploded && (
                <div className={`
                    absolute inset-0
                    bg-destructive-action
                    [clip-path:polygon(49%_43%,65%_0%,61%_51%,100%_24%,63%_70%,42%_70%,0%_40%,34%_45%,17%_0%)]
                `} />
            )}

            {discarded && (
                <div className={`
                    absolute inset-0
                    bg-destructive-action
                    [clip-path:polygon(0_0,0_0,33%_50%,0_100%,0_100%,50%_60%,100%_100%,100%_100%,66%_50%,100%_0,100%_0,50%_33%)]
                `} />
            )}

            {/* Foreground Icon */}
            {getDieSizeIcon()}
        </div>
    )
}