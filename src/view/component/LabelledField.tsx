import { ReactNode } from "react"
import { sheetPropLabel, sheetPropLabelVariant } from "../common/text-styles"

export const LabelledField = ({ label, children, className, variant = "steel" }: { label: string, children: ReactNode, className?: string, variant?: "steel" | "alternate" }) => {
    const labelStyle = `${className != null ? className : `${variant === "steel" ? sheetPropLabel : sheetPropLabelVariant} font-bold`}`
    return (
        <div>
            <div className={labelStyle}>{label}</div>
            {children}
        </div>
    )
}