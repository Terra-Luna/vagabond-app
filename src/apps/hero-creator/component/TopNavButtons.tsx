import { ReactNode } from "react"
import { HeroCreationSubtext } from "./HeroCreationTypography"

export const TopNavButtons = ({ navButtons, subtitle }: { navButtons: ReactNode[], subtitle: string }) => {
    if (navButtons.length === 0) return <></>
    return (
        <div className="flex items-center justify-between gap-x-4 -mt-3">
            <div>{navButtons[0]}</div>
            <div className="text-center">
                <HeroCreationSubtext text={subtitle} />
            </div>
            <div>{navButtons[1]}</div>
        </div>
    )
}