import { Sparkle } from "lucide-react"
import { SpellDelivery } from "../../../../../../../combat/spellcasting/SpellDelivery"
import { vgLiteLang } from "../../../../../../../utils/lang"
import { SpellcastingLabel } from "./SpellcastingTypography"

export const TotalMana = ({ delivery }: { delivery: SpellDelivery }) => {
    return (
        <div className="text-center ml-auto">
            <SpellcastingLabel text={vgLiteLang.HeroSheet.Magic.labelCost} />
            <div className="flex gap-x-1 items-center">
                <Sparkle size={18} className="text-mana" />
                <SpellcastingLabel text={delivery.manaCost} />
            </div>
        </div>
    )
}