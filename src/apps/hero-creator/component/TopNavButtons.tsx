import { ReactNode } from "react"

import { HeroCreationSubtext } from "./HeroCreationTypography"

export const TopNavButtons = ({ navButtons, subtitle = "", canProceed }: { navButtons: ReactNode[], subtitle?: string, canProceed: boolean }) => {
    if (navButtons.length === 0) return <></>
    return (
        <div className="flex items-center justify-between gap-x-4 -mt-3">
            {/* BACK */}
            <div>{navButtons[0]}</div>

            {/* CENTRAL SUBHEADER TEXT */}
            <div className="text-center grow">
                <HeroCreationSubtext text={subtitle} />
            </div>

            {/* NEXT */}
            <div className={!canProceed ? "invisible pointer-events-none" : ""}>
                {navButtons[1]}
            </div>
        </div>
    )
}