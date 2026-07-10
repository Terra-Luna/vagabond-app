import { vgLiteLang } from "../../../../../../utils/lang"
import { HeroCreationLabel } from "./HeroCreationTypography"

export const StatDragTarget = ({ stat, stats, isKeyStat, onDragDrop, currentAssignment, dragOverStat, setDragOverStat }) => {
    const strings = vgLiteLang.HeroCreation
    const isHovered = dragOverStat === stat
    return (
        <div>
            <HeroCreationLabel text={stats[stat].name} />
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
                    min-h-[56px] w-[72px] px-4 py-4
                    ${isHovered ? 'border-table-border' : 'border-transparent'}
                `}
            >
                {
                    currentAssignment?.value ? (
                        <span className="font-bold">{currentAssignment.value}</span>
                    ) : (
                        <p className="text-sm text-text-header-primary font-paradigm">{strings.dropHere}</p>
                    )
                }
            </div>
        </div>
    )
}