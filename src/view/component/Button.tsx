import { ReactNode } from "react"
import { Trash } from "lucide-react"
import { glowOnHover } from "../common/text-styles"

const buttonShaping = `flex items-center px-2 py-1 rounded-sm cursor-pointer ${glowOnHover}`
const primaryButtonClasses = `text-btn-primary-text bg-btn-primary-fill ${buttonShaping} border border-solid border-stat-block-fill`
const secondaryButtonClasses = `text-btn-secondary-text ${buttonShaping} border border-solid border-stat-block-fill`
const destructiveButtonClasses = `text-destructive-action ${buttonShaping} border border-solid border-destructive-action`

export const PrimaryButton = ({ children, icon = null, onClick }: { children: ReactNode, icon?: ReactNode, onClick: () => any }) => {
    return (
        <button onClick={onClick} className={primaryButtonClasses}>
            {icon ? icon : undefined}
            <div className="mx-0.5" />
            {children}
        </button>
    )
}

export const SecondaryButton = ({ children, icon = null, onClick }: { children: ReactNode, icon?: ReactNode, onClick: () => any }) => {
    return (
        <button onClick={onClick} className={secondaryButtonClasses}>
            {icon ? icon : undefined}
            <div className="mx-0.5" />
            {children}
        </button>
    )
}

export const DestructiveButton = ({ children, icon = <Trash size={14} />, onClick }: { children?: ReactNode, icon?: ReactNode, onClick: () => any }) => {
    return (
        <button onClick={onClick} className={destructiveButtonClasses}>
            {icon}
            {children ? <>
                <div className="mx-0.5" />
                {children}
            </> : undefined}
        </button>
    )
}