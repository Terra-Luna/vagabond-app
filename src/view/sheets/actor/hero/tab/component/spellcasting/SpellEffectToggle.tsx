import { vgLiteLang } from "../../../../../../../utils/lang"
import { Checkbox } from "../../../../../../component/Checkbox"
import { SpellcastingLabel } from "./SpellcastingTypography"

export const SpellEffectToggle = ({ isEffect, onSpellEffectToggle }) => {
    return (
        <div className="items-center">
            <SpellcastingLabel text={vgLiteLang.HeroSheet.Magic.labelEffect} />
            <Checkbox label={''} onCheckedChanged={onSpellEffectToggle} checked={isEffect} />
        </div>
    )
}