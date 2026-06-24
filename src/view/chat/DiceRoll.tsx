
export const DiceRoll = ({ faces, result }: { faces: number, result: number }) => {
    return (
        <div className="relative">
            <div className="abosolute">
                <DieIcon faces={faces} />
                <div className="text-xl font-eskapade font-bold">{result}</div>
            </div>
        </div>
    )
}

const DieIcon = ({ faces }: { faces: number }) => {
    let src = ''
    if (faces === 20) src = 'systems/vagabond-lite/assets/icons/dice/d20-blank.svg'
    else if (faces === 12) src = 'systems/vagabond-lite/assets/icons/dice/d12-blank.svg'
    else if (faces === 10) src = 'systems/vagabond-lite/assets/icons/dice/d10-blank.svg'
    else if (faces === 8) src = 'systems/vagabond-lite/assets/icons/dice/d8-blank.svg'
    else if (faces === 6) src = 'systems/vagabond-lite/assets/icons/dice/d6-blank.svg'
    else if (faces === 4) src = 'systems/vagabond-lite/assets/icons/dice/d4-blank.svg'
    return (<>{
        src.length > 0 ? <img src={src} height={33} width={33} alt={''} /> : <></>
    }</>)
}