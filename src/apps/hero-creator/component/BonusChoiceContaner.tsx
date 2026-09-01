import { ReactNode } from "react"

import { tableBorderRounded } from "../../../view/common/border-styles"

export const BonusChoiceContainer = ({ children }: { children: ReactNode }) => {
    return (
        <div className={`bg-wealth-fill p-2 mt-4 ${tableBorderRounded}`}>
            {children}
        </div>
    )
}

export const BonusChoiceTitle = ({ text }: { text: string }) => {
    return (
        <p className="text-xl text-wealth-denom-label font-eskapade font-bold">
            {text}
        </p>
    )
}