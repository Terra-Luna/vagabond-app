import { PerTargetDelivery } from "../../../../../../../combat/spellcasting/SpellDelivery"
import { SpellcastingLabel } from "./SpellcastingTypography"
import { NumericCounterInput } from "../../../../../../component/CounterImput"

export const SpellTargetInput = ({ delivery, onUpdateTargetCount, readOnly }: {
    delivery: PerTargetDelivery, onUpdateTargetCount: (input: string | null) => void, readOnly: boolean
}) => {
    return (
        <div className="flex text-center min-w-[3ch]">
            <div className="flex flex-col">
                <SpellcastingLabel text={delivery.targetLabel} />
                <span className="text-2xl">
                    {
                        readOnly ?
                            <p>{delivery.targetTokens.length}</p> :
                            <NumericCounterInput value={delivery.targetCount} onUpdateValue={onUpdateTargetCount} />
                    }
                </span>
            </div>
        </div>
    )
}