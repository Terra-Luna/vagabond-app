import { ReactNode } from "react"

import { tableBorderRounded } from "../../../view/common/border-styles"

export const BorderedContent = ({ children, className = '' }: { children: ReactNode, className?: string }) => {
    return (
        <div className={`flex w-fit gap-x-2 px-4 py-2 mx-auto justify-center ${tableBorderRounded} ${className}`}>
            {children}
        </div>
    )
}