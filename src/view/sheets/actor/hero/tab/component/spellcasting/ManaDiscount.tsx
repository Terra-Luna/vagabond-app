import { appLang } from "../../../../../../../utils/lang"
import { NumericCounterInput } from "../../../../../../component/EditableTextField"
import { SpellcastingLabel } from "./SpellcastingTypography"

export const ManaDiscount = ({ discount, onUpdateDiscount }) => {
    return (
        <div className="flex flex-col items-start">
            <SpellcastingLabel text={appLang.HeroSheet.Magic.labelDiscount} />
            <NumericCounterInput value={discount} onChange={onUpdateDiscount} />
        </div>
    )
}