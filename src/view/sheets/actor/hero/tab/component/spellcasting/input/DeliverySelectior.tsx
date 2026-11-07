import { getDeliveryDropdownOptions, SpellDelivery } from "../../../../../../../../combat/spellcasting/SpellDelivery"
import { appLang } from "../../../../../../../../util/lang"
import { DropDown } from "../../../../../../../component/Dropdown"
import { CanvasControlsInfo } from "./CanvasControlsInfo"
import { SpellcastingLabel } from "./SpellcastingTypography"

export const DeliverySelector = ({
  deliveries,
  currentDelivery,
  onSelect,
}: {
  deliveries: SpellDelivery[]
  currentDelivery: SpellDelivery | undefined
  onSelect: (index: number) => void
}) => {
  return (
    <div>
      <div className="flex items-center gap-x-1">
        <SpellcastingLabel text={appLang.HeroSheet.Magic.labelDelivery} />
        <CanvasControlsInfo delivery={currentDelivery} />
      </div>
      <DropDown
        value={deliveries
          .findIndex((d) => d.name === currentDelivery?.name)
          .toString()}
        options={getDeliveryDropdownOptions(deliveries)}
        updateMechanism={{ onChange: onSelect }}
      />
    </div>
  )
}
