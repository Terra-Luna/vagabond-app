import { ReactNode } from "react"

export const SheetHeader = ({ name, subtitle }: { name: ReactNode, subtitle: ReactNode }) => {
    return <div className="vglite-sheet-header">
        <div className="name">{name}</div>
        <div className="descriptor">{subtitle}</div>
    </div>
}