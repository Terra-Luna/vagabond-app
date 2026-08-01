import { vgLiteLang } from "../../../../../../../utils/lang"
import { NumericCounterInput } from "../../../../../../component/EditableTextField"
import { SpellcastingLabel } from "./SpellcastingTypography"

export const LineExpansionInut = ({ delivery, onUpdateHeight, onUpdateWidth }) => {
    return (
        <div className="flex gap-x-2 ml-2">
            <div className="flex-col">
                <SpellcastingLabel text={vgLiteLang.HeroSheet.Magic.labelHeight} />
                <span className="text-2xl">
                    <NumericCounterInput value={delivery.height} onUpdateValue={onUpdateHeight} valueAppend={"'"} incrementBy={10} />
                </span>
            </div>
            <div className="flex-col">
                <SpellcastingLabel text={vgLiteLang.HeroSheet.Magic.labelWidth} />
                <span className="text-2xl">
                    <NumericCounterInput value={delivery.width} onUpdateValue={onUpdateWidth} valueAppend={"'"} incrementBy={5} />
                </span>
            </div>
        </div>
    )
}