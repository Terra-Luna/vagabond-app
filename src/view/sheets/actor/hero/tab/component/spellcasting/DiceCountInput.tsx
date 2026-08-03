import { NumericCounterInput } from "../../../../../../component/EditableTextField"

export const DiceCountInput = ({ dmgDice, onUpdateDmgDice }) => {
    return (
        <div className="flex flex-col items-center justify-center">
            <span className="text-2xl">
                <NumericCounterInput value={dmgDice} onChange={onUpdateDmgDice} />
            </span>
        </div>
    )
}