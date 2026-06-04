import { ReactNode } from "react";

export const LabelledField = ({ label, children, className }: { label: string, children: ReactNode, className?: string }) => {
    return (
        <>
            <div className={className}>{label}</div>
            {children}
        </>
    )
}