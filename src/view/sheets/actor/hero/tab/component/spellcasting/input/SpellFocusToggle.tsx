import { appLang } from "../../../../../../../../util/lang"
import { Checkbox } from "../../../../../../../component/Checkbox"
import { SpellcastingLabel } from "./SpellcastingTypography"

export const SpellFocusToggle = ({
  isFocused,
  onToggleSpellFocus,
  disabled = false,
}: {
  isFocused: boolean
  onToggleSpellFocus: (isFocused: boolean) => void
  /** The caster has no Focus left to give; shown dimmed and can't be ticked. */
  disabled?: boolean
}) => {
  return (
    <div
      className="flex gap-x-0.5 items-center"
      title={disabled ? appLang.Spellcasting.maxFocusMessage : undefined}
    >
      <Checkbox
        label={""}
        onCheckedChanged={onToggleSpellFocus}
        checked={isFocused}
        disabled={disabled}
      />
      <span className={disabled ? "opacity-40" : undefined}>
        <SpellcastingLabel text={appLang.HeroSheet.Magic.labelFocus} />
      </span>
    </div>
  )
}
