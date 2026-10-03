import { NumericCounterInput } from "../../../../../../../component/EditableTextField"

export const DiceCountInput = ({ dmgDice, onUpdateDmgDice, width = "max-w-[3ch]" }) => {
    return (
        <div className={`flex flex-col items-center justify-center text-xl`}>
            <NumericCounterInput value={dmgDice} onChange={onUpdateDmgDice} width={width} />
        </div>
    )
}