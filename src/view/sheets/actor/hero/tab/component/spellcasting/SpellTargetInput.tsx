import { PerTargetDelivery } from "../../../../../../../combat/spellcasting/SpellDelivery"
import { NumericCounterInput } from "../../../../../../component/EditableTextField"
import { SpellcastingLabel } from "./SpellcastingTypography"

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
                            <p>{delivery.targetTokenIds.length}</p> :
                            <NumericCounterInput value={delivery.targetCount} onChange={onUpdateTargetCount} />
                    }
                </span>
            </div>
        </div>
    )
}