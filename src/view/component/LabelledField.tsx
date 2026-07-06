import { ReactNode } from "react"
import { sheetPropLabel, sheetPropLabelVariant } from "../common/text-styles"

export const LabelledField = ({ label, children, className, variant = "standard" }: { label: string, children: ReactNode, className?: string, variant?: "standard" | "alternate" }) => {
    const labelStyle = `${className != null ? className : `${variant === "standard" ? sheetPropLabel : sheetPropLabelVariant} font-bold`}`
    return (
        <div>
            <div className={labelStyle}>{label}</div>
            {children}
        </div>
    )
}