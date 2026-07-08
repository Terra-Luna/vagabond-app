import { Dices } from "lucide-react"
import { NumericCounterInput } from "../../../../../../component/CounterImput"

export const DamageDiceInput = ({ dmgDice, onUpdateDmgDice }) => {
    return (
        <div>
            <Dices size={24} className="text-text-header-tertiary" />
            <NumericCounterInput value={dmgDice} onUpdateValue={onUpdateDmgDice}/>
        </div>
    )
}