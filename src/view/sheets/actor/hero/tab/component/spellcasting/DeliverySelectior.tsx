import { getDeliveryDropdownOptions, SpellDelivery } from "../../../../../../../combat/spellcasting/SpellDelivery"
import { vgLiteLang } from "../../../../../../../utils/lang"
import { DropDown } from "../../../../../../component/Dropdown"
import { SpellcastingLabel } from "./SpellcastingTypography"

export const DeliverySelector = ({ deliveries, currentDelivery, onSelect }: {
    deliveries: SpellDelivery[], currentDelivery: SpellDelivery | undefined, onSelect: (index: number) => void
}) => {
    return (
        <div className="flex gap-x-2">
            <div>
                <SpellcastingLabel text={vgLiteLang.HeroSheet.Magic.labelDelivery} />
                <DropDown
                    value={deliveries.findIndex(d => d.name === currentDelivery?.name).toString()}
                    options={getDeliveryDropdownOptions(deliveries)}
                    updateMechanism={{ onChange: onSelect }}
                />
            </div>
        </div>
    )
}