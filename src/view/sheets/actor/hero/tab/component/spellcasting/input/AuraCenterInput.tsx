import type { AuraCenter } from "../../../../../../../../combat/spellcasting/SpellDelivery"
import { appLang } from "../../../../../../../../util/lang"
import { SingleSelect } from "../../../../../../../component/SingleSelect"
import { alwaysEditingContext, EditModeContext } from "../../../../../../../context/EditModeContext/Hooks"
import { SpellcastingLabel } from "./SpellcastingTypography"

const labels = appLang.HeroSheet.Magic

/** Chooses whether an Aura surrounds the caster or their Familiar. */
export const AuraCenterInput = ({
  center,
  onSelectCenter,
}: {
  center: AuraCenter
  onSelectCenter: (center: AuraCenter) => void
}) => {
  return (
    <div className="flex flex-col">
      <SpellcastingLabel text={labels.labelAuraCenter} />
      <EditModeContext.Provider value={alwaysEditingContext}>
        <SingleSelect
          value={center}
          setValue={onSelectCenter}
          options={[
            { label: labels.auraCenterSelf, value: "self" },
            { label: labels.auraCenterFamiliar, value: "familiar" },
          ]}
        />
      </EditModeContext.Provider>
    </div>
  )
}
