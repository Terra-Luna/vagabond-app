import { Sparkle } from "lucide-react"
import { vgLiteLang } from "../../../../../../../utils/lang"
import { SpellcastingLabel, SpellcastingValue } from "./SpellcastingTypography"

export const TotalMana = ({ cost }: { cost: number }) => {
    return (
        <div className="-space-y-2 ml-auto flex flex-col items-end">
            <SpellcastingLabel text={vgLiteLang.HeroSheet.Magic.labelCost} />
            <div className="flex gap-x-1 items-center min-w-16 justify-end">
                <Sparkle size={18} className="text-mana" />
                <SpellcastingValue text={cost} />
            </div>
        </div>
    )
}