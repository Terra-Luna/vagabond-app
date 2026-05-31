import { ReactNode } from "react";

export const LabelledField = ({ label, children }: { label: string, children: ReactNode }) => {
    return (
        <>
            <div className="vglite-label">{label}</div>
            {children}
        </>
    )
}