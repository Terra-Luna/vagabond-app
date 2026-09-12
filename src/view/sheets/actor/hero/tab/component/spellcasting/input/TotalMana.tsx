import { Sparkle } from "lucide-react"

import { Tooltip } from "../../../../../../../component/Tooltip"
import { SpellcastingMana } from "./SpellcastingTypography"

export const TotalMana = ({ cost }: { cost: number }) => {
    return (
        <Tooltip title={`Total Mana: ${cost}`} content={<></>}>
            <div className="flex items-center mx-1 -mt-2 hover-glow">
                <Sparkle size={14} className="text-mana" />
                <SpellcastingMana text={cost} />
            </div>
        </Tooltip>
    )
}