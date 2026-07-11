import { Key } from "lucide-react"
import { vgLiteLang } from "../../../../../../utils/lang"
import { HeroCreationLabel } from "./HeroCreationTypography"

export const StatDragTarget = ({ stat, stats, isKeyStat, onDragDrop, currentAssignment, dragOverStat, setDragOverStat, bonusStats }) => {
    const strings = vgLiteLang.HeroCreation
    const isHovered = dragOverStat === stat
    const statBonus = bonusStats?.filter(b => b.stat === currentAssignment.stat)?.reduce((sum, b) => { return sum + b.bonus }, 0) ?? 0

    return (
        <div>
            <div className="flex gap-x-1 justify-center">
                <HeroCreationLabel text={stats[stat].name} />
                {
                    isKeyStat ? <Key size={24} className="text-text-header-tertiary" strokeWidth={2} /> : <></>
                }
            </div>
            <div
                onDragOver={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    e.nativeEvent.stopImmediatePropagation()
                }}
                onDragEnter={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    e.nativeEvent.stopImmediatePropagation()
                    setDragOverStat(stat)
                }}
                onDrop={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    e.nativeEvent.stopImmediatePropagation()
                    onDragDrop(e, stat)
                    setDragOverStat(stat)
                    setDragOverStat(null)
                }}
                className={`
                    flex items-center justify-center
                    text-center text-3xl text-text-stat-block
                    bg-stat-block-fill rounded-md
                    border border-dashed architecture-transition
                    hover:border-table-border
                    min-h-[56px] w-[100px] px-4 py-4
                    ${isHovered ? 'border-table-border' : 'border-transparent'}
                `}
            >
                {
                    currentAssignment?.value ?
                        <div className="flex gap-x-1">
                            <span className="font-bold">{`
                                ${currentAssignment.value}${statBonus ? `+${statBonus}` : ''}
                            `}</span>
                        </div> :
                        <p className="text-sm text-text-tertiary font-paradigm">
                            {strings.dropHere}
                        </p>
                }
            </div>
        </div>
    )
}