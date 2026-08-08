import { ReactNode } from "react"
import { Trash } from "lucide-react"

const buttonShaping = `flex items-center text-base text-center justify-center px-2 py-1 rounded-sm hover-glow`
const primaryButtonClasses = `text-btn-primary-text font-paradigm bg-btn-primary-fill ${buttonShaping} border border-solid border-stat-block-fill`
const secondaryButtonClasses = `text-btn-secondary-text font-paradigm ${buttonShaping} border border-solid btn-secondary-text/80`
const destructiveButtonClasses = `text-destructive-action font-paradigm ${buttonShaping} border border-solid border-destructive-action/50`

export const PrimaryButton = ({ type = "button", title = '', children, icon = null, onClick = () => { } }: {
    type?: any, title?: string, children: ReactNode, icon?: ReactNode, onClick?: (e) => any
}) => {
    return (
        <button type={type} title={title} onClick={(e) => onClick(e)} className={primaryButtonClasses}>
            {icon ? icon : undefined}
            <div className="mx-0.5" />
            {children}
        </button>
    )
}

export const SecondaryButton = ({ type = "button", title = '', children, icon = null, onClick }: {
    type?: any, title?: string, children: ReactNode, icon?: ReactNode, onClick: () => any
}) => {
    return (
        <button type={type} title={title} onClick={onClick} className={secondaryButtonClasses}>
            {icon ? icon : undefined}
            <div className="mx-0.5" />
            {children}
        </button>
    )
}

export const DestructiveButton = ({ type = "button", title = '', children, icon = <Trash size={14} />, onClick }: {
    type?: any, title?: string, children?: ReactNode, icon?: ReactNode, onClick: () => any
}) => {
    return (
        <button type={type} title={title} onClick={onClick} className={destructiveButtonClasses}>
            {icon}
            {children ? <>
                <div className="mx-0.5" />
                {children}
            </> : undefined}
        </button>
    )
}