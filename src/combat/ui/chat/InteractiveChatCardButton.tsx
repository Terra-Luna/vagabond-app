import { ReactNode } from "react"

import { tableBorder } from "../../../view/common/border-styles"
import { buttonAnimation } from "../../../view/component/Button"
import { Tooltip } from "../../../view/component/Tooltip"

export const InteractiveChatCardButton = ({ icon, label, tooltip, fn }: { icon?: ReactNode, label: string, tooltip: string, fn: () => void }) => {
    return (
        <Tooltip title={label} content={tooltip}>
            <button className={`flex items-center justify-center px-2 hover-glow pointer-events-auto ${buttonAnimation} ${tableBorder}`} onClick={fn}>
                {icon}
                {label}
            </button>
        </Tooltip>
    )
}
