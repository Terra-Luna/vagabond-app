import { Square,SquareCheckBig } from "lucide-react"

import { vgLiteLang } from "../../../utils/lang"
import { tableBorderRounded } from "../../../view/common/border-styles"
import { HeroCreationLabel, HeroCreationSubtext } from "./HeroCreationTypography"

export const TrainingSelector = ({ skill, label, isSelected, onSelect }) => {
    return (
        <div onClick={() => onSelect(skill, !isSelected)}
            className={`
                flex gap-x-2 justify-between items-center p-2 
                ${tableBorderRounded} cursor-pointer
                hover:bg-context-menu-fill/75
                ${isSelected ? 'bg-context-menu-fill' : 'bg-context-menu-fill/25'}
            `}>
            <div className="flex-col">
                <div className="flex gap-x-2 items-center">
                    {
                        isSelected ?
                            <SquareCheckBig size={18} className="text-text-header-tertiary" /> :
                            <Square size={18} className="text-text-header-tertiary/40" />
                    }
                    <HeroCreationLabel text={label} />
                    <HeroCreationSubtext text={`(${vgLiteLang.Skills[skill].stat})`} />
                </div>
                <div className="text-xs text-text-secondary font-paradigm font-normal italic">
                    {vgLiteLang.Skills[skill].description}
                </div>
            </div>
        </div>
    )
}