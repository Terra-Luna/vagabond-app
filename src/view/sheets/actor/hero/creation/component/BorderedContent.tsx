import { ReactNode } from "react"

export const BorderedContent = ({ children, className = '' }: { children: ReactNode, className?: string }) => {
    return (
        <div className={`flex w-fit gap-x-2 px-4 py-2 mx-auto justify-center border border-solid border-table-border rounded-md ${className}`}>
            {children}
        </div>
    )
}