import { Dices } from "lucide-react"
import { NumericCounterInput } from "../../../../../../component/EditableTextField"

export const DamageDiceInput = ({ dmgDice, onUpdateDmgDice }) => {
    return (
        <div className="ml-auto">
            <Dices size={24} className="text-text-header-tertiary" />
            <span className="text-lg">
                <NumericCounterInput value={dmgDice} onUpdateValue={onUpdateDmgDice} />
            </span>
        </div>
    )
}