import { SquareCheckBig, Square } from "lucide-react"
import { vgLiteLang } from "../../../utils/lang"
import { HeroCreationLabel, HeroCreationSubtext } from "./HeroCreationTypography"

export const TrainingSelector = ({ skill, label, isSelected, onSelect }) => {
    return (
        <div onClick={() => onSelect(skill, !isSelected)}
            className={`
                flex gap-x-2 justify-between items-center p-2 
                border border-solid border-table-border rounded-sm 
                cursor-pointer
                hover:bg-context-menu-fill/75
                ${isSelected ? 'bg-context-menu-fill' : 'bg-context-menu-fill/25'}
            `}>
            <div className="flex gap-x-2 items-center">
                {
                    isSelected ?
                        <SquareCheckBig size={18} className="text-text-header-tertiary" /> :
                        <Square size={18} className="text-text-header-tertiary/40" />
                }
                <HeroCreationLabel text={label} />
                <HeroCreationSubtext text={`(${vgLiteLang.Skills[skill].stat})`} />
            </div>
        </div>
    )
}