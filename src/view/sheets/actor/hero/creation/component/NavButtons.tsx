import { ReactNode } from "react"
import { useNavigationContext } from "../../../../../context/EditModeContext/Hooks"

export const useNavButtons = () => {
    const { backButton, nextButton } = useNavigationContext()

    const NavButtons = ({ header }: { header: ReactNode }) => {
        return(
            <div className="flex gap-x-2 justify-between">
                {backButton}
                {header}
                {nextButton}
            </div>
        )
    }

    return { NavButtons }
}