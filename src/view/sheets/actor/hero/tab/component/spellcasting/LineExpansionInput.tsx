import { appLang } from "../../../../../../../utils/lang"
import { NumericCounterInput } from "../../../../../../component/EditableTextField"
import { SpellcastingLabel } from "./SpellcastingTypography"

export const LineExpansionInut = ({ delivery, onUpdateHeight, onUpdateWidth }) => {
    return (
        <div className="flex gap-x-1">
            <div className="flex-col">
                <SpellcastingLabel text={appLang.HeroSheet.Magic.labelHeight} />
                <span className="text-2xl">
                    <NumericCounterInput value={delivery.height} onChange={onUpdateHeight} valueAppend={"'"} incrementBy={10} />
                </span>
            </div>
            <div className="flex-col">
                <SpellcastingLabel text={appLang.HeroSheet.Magic.labelWidth} />
                <span className="text-2xl">
                    <NumericCounterInput value={delivery.width} onChange={onUpdateWidth} valueAppend={"'"} incrementBy={5} />
                </span>
            </div>
        </div>
    )
}