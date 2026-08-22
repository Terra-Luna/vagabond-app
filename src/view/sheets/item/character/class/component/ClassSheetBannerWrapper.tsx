import { ReactNode } from "react"

import { Divider } from "../../../../../component/Header"

export const ClassSheetBannerWrapper = ({ children, editModeToggleBtn = undefined }: { children: ReactNode, editModeToggleBtn?: ReactNode}) => {
    return (
        <div className="flex items-center p-2 bg-sheet-header-fill">
            <div className="text-3xl text-text-header-primary font-eskapade font-bold">
                {children}
            </div>
            <Divider />
            {editModeToggleBtn}
        </div>
    )
}