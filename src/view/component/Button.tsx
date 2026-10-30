import { Trash } from "lucide-react"
import { ReactNode } from "react"

import { tableBorder } from "../common/border-styles"
import { Tooltip } from "./Tooltip"

export const buttonAnimation = `pointer-events-auto hover-glow cursor-pointer transition-transform active:scale-95`
const disabledButtonStyle = `pointer-events-auto opacity-50`
const buttonShaping = `flex items-center text-base text-center justify-center gap-x-2 px-2 py-1 rounded-sm hover-glow`
const primaryButtonClasses = `text-btn-primary-text font-paradigm font-normal bg-btn-primary-fill ${buttonShaping} ${buttonAnimation} border border-solid border-btn-primary-fill`
const secondaryButtonClasses = `text-btn-secondary-text font-paradigm font-normal ${buttonShaping} ${buttonAnimation} border border-solid btn-secondary-text/80`
const destructiveButtonClasses = `text-destructive-action font-paradigm font-normal ${buttonShaping} ${buttonAnimation} border border-solid border-destructive-action/50`

export const PrimaryButton = ({ type = "button", title = '', children, icon = null, onClick = () => { }, disabled = false }: {
    type?: any, title?: string, children: ReactNode, icon?: ReactNode, onClick?: (e) => any, disabled?: boolean
}) => {
    return (
        <Tooltip content={title}>
            <button disabled={disabled} type={type} onClick={(e) => onClick(e)} className={`${primaryButtonClasses} ${disabled ? 'opacity-50 scale-95' : ''}`}>
                {icon ? icon : undefined}
                {children}
            </button>
        </Tooltip>
    )
}

export const SecondaryButton = ({ type = "button", title = '', children, icon = null, onClick }: {
    type?: any, title?: string, children: ReactNode, icon?: ReactNode, onClick: () => any
}) => {
    return (
        <Tooltip content={title}>
            <button type={type} onClick={onClick} className={secondaryButtonClasses}>
                {icon
                    ? icon
                    : undefined
                }
                {children}
            </button>
        </Tooltip>
    )
}

export const DestructiveButton = ({ type = "button", title = '', children, icon = <Trash size={14} />, hideIcon, onClick }: {
    type?: any, title?: string, children?: ReactNode, icon?: ReactNode, hideIcon?: boolean, onClick: () => any
}) => {
    return (
        <Tooltip content={title}>
            <button type={type} onClick={onClick} className={`${destructiveButtonClasses}`}>
                {!hideIcon && icon}
                {children
                    ? children
                    : undefined
                }
            </button>
        </Tooltip>
    )
}

export const UtilityButton = ({ type = "button", title = "", children, icon = null, onClick, disabled = false }: {
    type?: any, title?: string, children: ReactNode, icon?: ReactNode, onClick: (e?: React.MouseEvent<HTMLButtonElement>) => any, disabled?: boolean
}) => {
    return (
        <Tooltip content={title}>
            <button type={type}
                disabled={disabled}
                onClick={onClick}
                onMouseDown={(e) => e.preventDefault()}
                className={`${disabled ? disabledButtonStyle : `hover-glow ${buttonAnimation}`} text-sm font-eskapade font-normal ${tableBorder} px-2 bg-sheet-main-fill`}
            >
                {icon}
                {children
                    ? children
                    : undefined
                }
            </button>
        </Tooltip>
    )
}