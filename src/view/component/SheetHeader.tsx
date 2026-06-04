import { ReactNode } from "react"

export const SheetHeader = ({ name, subtitle }: { name: ReactNode, subtitle: ReactNode }) => {
    return <div className="bg-section-header-fill">
        <div className="ml-2">
            <div className="text-text-section-header font-eskapade font-bold text-4xl">{name}</div>
            <div className="">{subtitle}</div>
        </div>
    </div>
}