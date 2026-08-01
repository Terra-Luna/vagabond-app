import { Dices } from "lucide-react"
import { NumericCounterInput } from "../../../../../../component/EditableTextField"

export const DamageDiceInput = ({ dmgDice, onUpdateDmgDice }) => {
    return (
        <div className="flex flex-col items-center justify-center">
            <Dices size={28} className="text-text-header-tertiary" />
            <span className="text-2xl">
                <NumericCounterInput value={dmgDice} onUpdateValue={onUpdateDmgDice} />
            </span>
        </div>
    )
}