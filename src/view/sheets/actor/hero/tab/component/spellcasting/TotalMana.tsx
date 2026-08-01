import { Sparkle } from "lucide-react"
import { vgLiteLang } from "../../../../../../../utils/lang"
import { SpellcastingLabel, SpellcastingValue } from "./SpellcastingTypography"

export const TotalMana = ({ cost }: { cost: number }) => {
    return (
        <div className="-space-y-2 ml-auto mr-2 text-center">
            <SpellcastingLabel text={vgLiteLang.HeroSheet.Magic.labelCost} />
            <div className="flex gap-x-1 items-center">
                <Sparkle size={18} className="text-mana" />
                <SpellcastingValue text={cost} />
            </div>
        </div>
    )
}