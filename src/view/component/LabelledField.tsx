import { ReactNode } from "react"
import { sheetPropLabel } from "../common/text-styles"

export const LabelledField = ({ label, children, className }: { label: string, children: ReactNode, className?: string }) => {
    const labelStyle = `${className != null ? className : sheetPropLabel}`
    return (
        <div>
            <div className={labelStyle}>{label}</div>
            {children}
        </div>
    )
}