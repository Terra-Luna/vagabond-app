import { ReactNode } from "react"

import { tableBorder } from "../../../view/common/border-styles"
import { buttonAnimation } from "../../../view/component/Button"
import { Tooltip } from "../../../view/component/Tooltip"

export const InteractiveChatCardButton = ({ icon, label, tooltip, fn, borderClassName }: { icon?: ReactNode, label: string | ReactNode, tooltip: string, fn: () => void, borderClassName?: string }) => {
    return (
        <Tooltip title={label} content={tooltip}>
            <button
                className={`flex items-center justify-center px-2 hover-glow pointer-events-auto 
                    ${buttonAnimation} ${borderClassName ?? tableBorder} rounded-sm
                `}
                onClick={fn}
            >
                {icon}
                {label}
            </button>
        </Tooltip>
    )
}
