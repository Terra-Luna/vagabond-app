import { Dices } from "lucide-react"
import { NumericCounterInput } from "../../../../../../component/CounterImput"

export const DamageDiceInput = ({ dmgDice, onUpdateDmgDice }) => {
    return (
        <div className="ml-auto">
            <Dices size={24} className="text-text-header-tertiary" />
            <span className="text-2xl">
                <NumericCounterInput value={dmgDice} onUpdateValue={onUpdateDmgDice} />
            </span>
        </div>
    )
}