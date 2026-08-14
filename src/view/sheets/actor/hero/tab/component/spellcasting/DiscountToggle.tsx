import { vgLiteLang } from "../../../../../../../utils/lang"
import { Checkbox } from "../../../../../../component/Checkbox"
import { SpellcastingLabel } from "./SpellcastingTypography"

export const DiscountToggle = ({ discount, onToggleDiscount }) => {
    return (
        <div className="flex gap-x-0.5 items-center">
            <Checkbox label={''} onCheckedChanged={onToggleDiscount} checked={discount} />
            <SpellcastingLabel text={vgLiteLang.HeroSheet.Magic.labelDiscount} />
        </div>
    )
}