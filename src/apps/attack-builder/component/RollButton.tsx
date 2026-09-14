import { Dices } from "lucide-react"

import { appLang } from "../../../utils/lang"
import { Tooltip } from "../../../view/component/Tooltip"

export const RollButton = ({ onClick }: { onClick: (e: React.MouseEvent<HTMLButtonElement>) => void }) => {
    return (
        <Tooltip title={appLang.ButtonActions.roll} content={appLang.HeroSheet.skills_tooltip}>
            <button type="button" onClick={(e) => onClick(e)} className="focus:outline-none">
                <Dices size={24} strokeWidth={2} className="mt-1 hover:text-text-header-tertiary transition-colors hover-glow cursor-pointer" />
            </button>
        </Tooltip>
    )
}