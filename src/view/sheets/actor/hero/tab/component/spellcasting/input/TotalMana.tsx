import { Sparkle } from "lucide-react"

import { Tooltip } from "../../../../../../../component/Tooltip"
import { SpellcastingMana } from "./SpellcastingTypography"

export const TotalMana = ({ cost }: { cost: number }) => {
    return (
        <Tooltip content={`Total Mana:${cost}`}>
            <div className="flex w-[6ch] shrink-0 items-center justify-end pr-2 -mt-2 hover-glow">
                <Sparkle size={14} className="text-mana" />
                <SpellcastingMana text={cost} />
            </div>
        </Tooltip>
    )
}