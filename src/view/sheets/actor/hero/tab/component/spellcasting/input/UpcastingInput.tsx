import { appLang } from "../../../../../../../../utils/lang"
import { NumericCounterInput } from "../../../../../../../component/EditableTextField"
import { SpellcastingLabel } from "./SpellcastingTypography"

export const UpcastingInput = ({ upcast, onUpdateUpcast }) => {
    return (
        <div className="flex flex-col items-start text-lg">
            <SpellcastingLabel text={appLang.HeroSheet.Magic.upcast} />
            <NumericCounterInput value={upcast} onChange={onUpdateUpcast} />
        </div>
    )
}