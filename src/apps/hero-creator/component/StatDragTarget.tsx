import { Key } from "lucide-react"

import { appLang } from "../../../utils/lang"
import { DropZone } from "../../../view/component/DropZone"
import { HeroCreationLabel } from "./HeroCreationTypography"

export const StatDragTarget = ({ stat, stats, isKeyStat, onDragDrop, onDragStart, currentAssignment, dragOverStat, setDragOverStat, bonusStats, flatStatBonuses }) => {
    const strings = appLang.HeroCreation
    const isHovered = dragOverStat === stat
    const selectedBonus = bonusStats?.filter(b => b.stat.replace("stats.", "") === currentAssignment.stat)?.reduce((sum, b) => { return sum + b.bonus }, 0) ?? 0
    const flatBonus = flatStatBonuses?.filter(b => b.stat === currentAssignment.stat)?.reduce((sum, b) => { return sum + b.bonus }, 0) ?? 0

    return (
        <div>
            <div className="flex gap-x-1 justify-center">
                <HeroCreationLabel text={stats[stat].name} />
                {isKeyStat && (
                    <Key size={18} className="self-center text-text-header-secondary" strokeWidth={2} />
                )}
            </div>
            <DropZone
                unstyled
                isHovered={isHovered}
                onHoverChange={(hovered) => setDragOverStat(hovered ? stat : null)}
                onDrop={(e) => onDragDrop(e, stat)}
                className={`
                    flex items-center justify-center
                    text-center text-5xl text-text-stat-block
                    bg-stat-block-fill rounded-md architecture-transition
                    border-2 hover:border-table-border min-h-[88px] w-[140px] px-4 py-4
                    ${isHovered
                        ? 'border-solid border-wealth-denom-label'
                        : 'border-dashed border-transparent'
                    }
                `}
            >
                {
                    currentAssignment?.value ?
                        <div
                            className="flex gap-x-1 w-full h-full items-center justify-center cursor-grab active:cursor-grabbing select-none"
                            draggable
                            onDragStart={(e) => onDragStart(e, currentAssignment.value, currentAssignment.poolIndex, stat)}
                        >
                            <span className="font-bold">{`
                                ${currentAssignment.value}
                                ${flatBonus ? `+${flatBonus}` : ''}
                                ${selectedBonus ? `+${selectedBonus}` : ''}
                            `}</span>
                        </div> :
                        <div className="text-base text-text-tertiary font-paradigm block">
                            <span className="inline">{strings.dropHere}</span>
                        </div>
                }
            </DropZone>
        </div>
    )
}