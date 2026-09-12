import { NumericCounterInput } from "../../../../../../../component/EditableTextField"
import { SpellcastingLabel } from "./SpellcastingTypography"

export const SpellRangeInput = ({ size, label, onUpdateAreaSize }) => {
    return (
        <div className="flex flex-col justify-center">
            <SpellcastingLabel text={label} />
            <span className="flex justify-center text-xl font-eskapade">
                <NumericCounterInput value={size} valueAppend={"'"} onChange={onUpdateAreaSize} incrementBy={5} />
            </span>
        </div>
    )
}