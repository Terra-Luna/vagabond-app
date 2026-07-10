import { useCallback, useEffect, useState } from "react"
import { HeroDataModel } from "../../../../../../model/actor/HeroDataModel"
import { vgLiteLang } from "../../../../../../utils/lang"
import { useNavButtons } from "../../../../../context/navigation/NavButtons"
import { Header } from "../../../../../component/Header"
import { HeroCreationDropdown } from "../component/HeroCreationDropdown"
import { SecondaryButton } from "../../../../../component/Button"
import { Dices } from "lucide-react"
import { ClassDataModel } from "../../../../../../model/item/character/ClassDataModel"
import { HeroCreationLabel, HeroCreationSubtext } from "../component/HeroCreationTypography"
import { DraggableStatBlock } from "../component/DraggableStatBlock"
import { StatDragTarget } from "../component/StatDragTarget"

export const useCoreStats = (hero: Actor & { system: HeroDataModel }, clazz: ClassDataModel | undefined) => {
    const strings = vgLiteLang.HeroCreation
    const { NavButtons } = useNavButtons()
    
    const stats = vgLiteLang.Stat
    const keyStats = clazz?.keyStats
    const statBlocks = vgLiteLang.BaseStatBlocks
    const [selectedArr, setSelectedArr] = useState<{ index: number, values: number[], usedIndices: number[] }>()
    const [assignedStats, setAssignedStats] = useState<{ stat: string, value: number | null, poolIndex: number | null }[]>([])
    const [dragOverKey, setDragOverStat] = useState<string | null>(null)
    
    const resetAssignedStats = () => {
        setAssignedStats(Object.keys(stats).map(s => ({ stat: s, value: null, poolIndex: null })))
    }

    useEffect(() => {
        setSelectedArr({ index: 0, values: statBlocks[0], usedIndices: [] })
        resetAssignedStats()
    }, [])

    const onSelectStatArray = useCallback((index: number) => {
        setSelectedArr({ index: index, values: statBlocks[index], usedIndices: []})
        resetAssignedStats()
    }, [])

    const randomizeStatBlockSelection = useCallback(async () => {
        const randomIndex = (await new Roll(`1d${statBlocks.length}`).evaluate()).total - 1
        setSelectedArr({ index: randomIndex, values: statBlocks[randomIndex], usedIndices: [] })
        resetAssignedStats()
    }, [])

    const onDragStart = (e: React.DragEvent, value: number, poolIndex: number) => {
        e.stopPropagation()
        e.dataTransfer.effectAllowed = "move"
        const payload = {
            type: "VgLiteStatBlock",
            value: value,
            poolIndex: poolIndex
        }
        e.dataTransfer.setData("text/plain", JSON.stringify(payload))
        console.log("ondragstart", value, poolIndex)
    }

    const onDragDrop = (e: React.DragEvent, targetStatKey: string) => {
        e.preventDefault()
        e.stopPropagation()
        const rawData = e.dataTransfer.getData("text/plain")
        if (!rawData) return
        const payload = JSON.parse(rawData)
        // Safely check our unique signature tag
        if (payload.type !== "VgLiteStatBlock") return

        const { value, poolIndex } = payload

        setAssignedStats(prev => {
            const existingAssignment = prev.find(item => item.stat === targetStatKey)
            const returnedIndex = existingAssignment?.poolIndex

            setSelectedArr(curr => {
                if (!curr) return curr
                let updatedUsed = [...curr.usedIndices, poolIndex]
                if (returnedIndex !== null && returnedIndex !== undefined) {
                    updatedUsed = updatedUsed.filter(idx => idx !== returnedIndex)
                }
                return { ...curr, usedIndices: updatedUsed }
            })

            return prev.map(item => item.stat === targetStatKey ? { ...item, value, poolIndex } : item)
        })
    }

    const renderCoreStats = (
        <div className="bg-sheet-main-fill space-y-4">
            <NavButtons header={<Header title={strings.coreStats} />} />
            <div className="w-full space-y-2 items-center justify-center text-center">
                <HeroCreationLabel text={strings.statArrayPool} />
                <HeroCreationSubtext text={strings.statArrayDrag} />
                {/* STAT POOL SELECTION */}
                <div className="flex gap-x-4 justify-center items-end">
                    <div>
                        <SecondaryButton
                            icon={<Dices size={14} />}
                            children={<p className="font-paradigm font-bold">{strings.statsRoll}</p>}
                            onClick={randomizeStatBlockSelection}
                        />
                    </div>
                    <span className="font-bold text-left">
                        <HeroCreationDropdown
                            label={strings.statsSelect}
                            value={selectedArr?.index?.toString() ?? '0'}
                            onChange={onSelectStatArray}
                            options={statBlocks.map((block, index) => (
                                { value: index, label: block.join(", ") + `  [${block.reduce((sum, it) => { return sum + it }, 0)}]` }
                            ))}
                        />
                    </span>
                </div>
                {/* SELECTED STAT POOL DRAGABLES */}
                <div className="justify-center">
                    <div
                        className="flex w-fit gap-x-2 p-2 mx-auto justify-center border border-solid border-table-border rounded-md">
                        {
                            selectedArr?.values?.map((it, index) => {
                                const isUsed = selectedArr.usedIndices.includes(index)
                                return (
                                    <DraggableStatBlock
                                        index={index}
                                        value={it}
                                        isUsed={isUsed}
                                        onDragStart={onDragStart}
                                    />
                                )
                            })
                        }
                    </div>
                    {/* STAT DRAG TARGETS */}
                    <div className="grid grid-cols-2 justify-items-center gap-4 px-8 mt-2 mb-12">
                        {
                            Object.keys(stats).map((statKey) => {
                                const currentAssignment = assignedStats.find(item => item.stat === statKey)
                                return (
                                    <StatDragTarget
                                        key={statKey}
                                        stat={statKey}
                                        stats={stats}
                                        isKeyStat={keyStats?.includes(statKey)}
                                        onDragDrop={onDragDrop}
                                        currentAssignment={currentAssignment}
                                        dragOverStat={dragOverKey}
                                        setDragOverStat={setDragOverStat}
                                    />
                                )
                            })
                        }
                    </div>
                </div>
            </div>
        </div>
    )

    return { renderCoreStats, assignedStats }
}