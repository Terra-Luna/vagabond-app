import { vgLiteLang } from "../../../../../../../utils/lang"
import { Checkbox } from "../../../../../../component/Checkbox"
import { SpellcastingLabel } from "./SpellcastingTypography"

export const SpellFocusToggle = ({ isFocused, onToggleSpellFocus }) => {
    return (
        <div className="flex gap-x-0.5 items-center">
            <Checkbox label={''} onCheckedChanged={onToggleSpellFocus} checked={isFocused} />
            <SpellcastingLabel text={vgLiteLang.HeroSheet.Magic.labelFocus} />
        </div>
    )
}