import { ReactNode } from "react"
import { useNavigationContext } from "../EditModeContext/Hooks"

export const useNavButtons = () => {
    const { backButton, nextButton } = useNavigationContext()

    const NavButtons = ({ header }: { header: ReactNode }) => {
        return(
            <div className="flex gap-x-0.5 justify-between">
                {backButton}
                {header}
                {nextButton}
            </div>
        )
    }

    return { NavButtons }
}