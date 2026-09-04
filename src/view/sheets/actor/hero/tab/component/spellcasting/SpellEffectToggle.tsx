import { appLang } from "../../../../../../../utils/lang"
import { Checkbox } from "../../../../../../component/Checkbox"
import { SpellcastingLabel } from "./SpellcastingTypography"

export const SpellEffectToggle = ({ isEffect, onSpellEffectToggle }) => {
    return (
        <div className="flex gap-x-0.5 items-center">
            <Checkbox label={''} onCheckedChanged={onSpellEffectToggle} checked={isEffect} />
            <SpellcastingLabel text={appLang.HeroSheet.Magic.labelEffect} />
        </div>
    )
}