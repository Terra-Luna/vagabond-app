import { NumericCounterInput } from "../../../../../../component/EditableTextField"
import { SpellcastingLabel } from "./SpellcastingTypography"

export const SpellRangeInput = ({ size, label, onUpdateAreaSize }) => {
    return (
        <div>
            <SpellcastingLabel text={label} />
            <span className="text-2xl">
                <NumericCounterInput value={size} valueAppend={"'"} onUpdateValue={onUpdateAreaSize} incrementBy={5} />
            </span>
        </div>
    )
}