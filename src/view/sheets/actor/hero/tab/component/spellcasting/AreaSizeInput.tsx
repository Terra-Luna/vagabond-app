import { vgLiteLang } from "../../../../../../../utils/lang"
import { NumericCounterInput } from "../../../../../../component/CounterImput"
import { SpellcastingLabel } from "./SpellcastingTypography"

export const AreaSizeInput = ({ size, onUpdateAreaSize }) => {
    return (
        <div>
            <SpellcastingLabel text={vgLiteLang.HeroSheet.Magic.labelArea} />
            <NumericCounterInput value={size} onUpdateValue={onUpdateAreaSize} incrementBy={5} />
        </div>
    )
}