import { DieIcon } from "./DieIcon"

export const DiceRollComponent = ({ faces, result, textSize = "text-4xl", exploded = false }: {
    faces: number,
    result: any,
    textSize?: string,
    exploded?: boolean
}) => {
    const centeredAlignment = "absolute flex items-center justify-center top-1/2 right-1/2 transform translate-x-1/2 -translate-y-1/2"
    return (
        <div className={`relative ${textSize}`}>
            <div className="relative inline-flex items-center justify-center">
                <DieIcon faces={faces} exploded={exploded} />
                <p className={`${centeredAlignment} text-[0.8em] text-dice-text h-[1em] w-[1em]`}>
                    {result}
                </p>
            </div>
        </div>
    )
}