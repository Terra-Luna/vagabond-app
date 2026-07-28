import { ReactNode } from "react"
import { Trash } from "lucide-react"
import { glowOnHover } from "../common/text-styles"

const buttonShaping = `flex items-center px-2 py-1 rounded-sm ${glowOnHover}`
const primaryButtonClasses = `text-lg text-btn-primary-text font-paradigm bg-btn-primary-fill ${buttonShaping} border border-solid border-stat-block-fill`
const secondaryButtonClasses = `text-lg text-btn-secondary-text font-paradigm ${buttonShaping} border border-solid btn-secondary-text/80`
const destructiveButtonClasses = `text-lg text-destructive-action font-paradigm ${buttonShaping} border border-solid border-destructive-action/50`

export const PrimaryButton = ({ type = "button", children, icon = null, onClick }: {
    type?: any, children: ReactNode, icon?: ReactNode, onClick: (e) => any
}) => {
    return (
        <button type={type} onClick={(e) => onClick(e)} className={primaryButtonClasses}>
            {icon ? icon : undefined}
            <div className="mx-0.5" />
            {children}
        </button>
    )
}

export const SecondaryButton = ({ type = "button", children, icon = null, onClick }: { type?: any, children: ReactNode, icon?: ReactNode, onClick: () => any }) => {
    return (
        <button type={type} onClick={onClick} className={secondaryButtonClasses}>
            {icon ? icon : undefined}
            <div className="mx-0.5" />
            {children}
        </button>
    )
}

export const DestructiveButton = ({ type = "button", children, icon = <Trash size={14} />, onClick }: { type?: any, children?: ReactNode, icon?: ReactNode, onClick: () => any }) => {
    return (
        <button type={type} onClick={onClick} className={destructiveButtonClasses}>
            {icon}
            {children ? <>
                <div className="mx-0.5" />
                {children}
            </> : undefined}
        </button>
    )
}