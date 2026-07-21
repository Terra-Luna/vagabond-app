import { ReactNode } from "react"

export const TopNavButtons = ({ navButtons }: { navButtons: ReactNode[] }) => {
    if (navButtons.length === 0) return <></>
    return (
        <div className="flex items-center justify-between gap-x-4 -mt-3">
            <div>{navButtons[0]}</div>
            <div>{navButtons[1]}</div>
        </div>
    )
}