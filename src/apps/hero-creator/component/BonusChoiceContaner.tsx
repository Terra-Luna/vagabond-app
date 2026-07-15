import { ReactNode } from "react"

export const BonusChoiceContainer = ({ children }: { children: ReactNode }) => {
    return (
        <div className="bg-wealth-fill border border-solid border-table-border rounded-md p-2 mt-4">
            {children}
        </div>
    )
}

export const BonusChoiceTitle = ({ text }: { text: string }) => {
    return (
        <p className="text-xl text-wealth-denom-label font-bold">
            {text}
        </p>
    )
}