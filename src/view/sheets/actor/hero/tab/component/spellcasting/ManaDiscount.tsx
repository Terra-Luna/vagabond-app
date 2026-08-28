import { vgLiteLang } from "../../../../../../../utils/lang"
import { NumericCounterInput } from "../../../../../../component/EditableTextField"
import { SpellcastingLabel } from "./SpellcastingTypography"

export const ManaDiscount = ({ discount, onUpdateDiscount }) => {
    return (
        <div className="flex flex-col items-start">
            <SpellcastingLabel text={vgLiteLang.HeroSheet.Magic.labelDiscount} />
            <NumericCounterInput value={discount} onChange={onUpdateDiscount} />
        </div>
    )
}