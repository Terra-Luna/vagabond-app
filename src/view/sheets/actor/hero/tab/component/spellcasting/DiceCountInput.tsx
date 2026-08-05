import { NumericCounterInput } from "../../../../../../component/EditableTextField"

export const DiceCountInput = ({ dmgDice, onUpdateDmgDice }) => {
    return (
        <div className="flex flex-col items-center justify-center text-xl">
            <NumericCounterInput value={dmgDice} onChange={onUpdateDmgDice} />
        </div>
    )
}