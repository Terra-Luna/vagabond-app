import { Sparkle } from "lucide-react"

import { SpellcastingMana } from "./SpellcastingTypography"

export const TotalMana = ({ cost }: { cost: number }) => {
    return (
        <div className="flex items-center">
            <Sparkle size={14} className="text-mana" />
            <SpellcastingMana text={cost} />
        </div>
    )
}