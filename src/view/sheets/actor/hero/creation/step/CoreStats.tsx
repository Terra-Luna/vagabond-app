import { useCallback, useEffect, useState } from "react"
import { calculateManaValues } from "../../../../../../model/actor/HeroDataModel"
import { vgLiteLang } from "../../../../../../utils/lang"
import { useNavButtons } from "../../../../../context/navigation/NavButtons"
import { Divider, Header } from "../../../../../component/Header"
import { HeroCreationDropdown } from "../component/HeroCreationDropdown"
import { SecondaryButton } from "../../../../../component/Button"
import { Dices, Undo } from "lucide-react"
import { ClassDataModel } from "../../../../../../model/item/character/ClassDataModel"
import { HeroCreationLabel, HeroCreationSubtext } from "../component/HeroCreationTypography"
import { DraggableStatBlock } from "../component/DraggableStatBlock"
import { StatDragTarget } from "../component/StatDragTarget"
import { AncestryDataModel, getAncestryStatBonuses } from "../../../../../../model/item/character/AncestryDataModel"

export const useCoreStats = (ancestry: AncestryDataModel | undefined, clazz: ClassDataModel | undefined) => {
    const strings = vgLiteLang.HeroCreation
    const stats = vgLiteLang.Stat
    const statBlocks = vgLiteLang.BaseStatBlocks
    const ancestryStatBonuses = getAncestryStatBonuses(ancestry)

    const { NavButtons, setCanProceed } = useNavButtons()
    const [selectedArr, setSelectedArr] = useState<{ index: number, values: number[], usedIndices: number[] }>()
    const [assignedStats, setAssignedStats] = useState<{ stat: string, value: number | null, poolIndex: number | null }[]>([])
    const [bonusStats, setBonusStats] = useState<{ stat: string, name: string, bonus: number }[]>([])
    const [dragOverKey, setDragOverStat] = useState<string | null>(null)
    
    const resetAssignedStats = () => {
        setCanProceed(false)
        setBonusStats([])
        setAssignedStats(Object.keys(stats).map(s => ({ stat: s, value: null, poolIndex: null })))
        setSelectedArr(prev => {
            if (!prev) return prev
            else return { ...prev, usedIndices: [] }
        })
    }

    /**
     * Initialize some states.
     */
    useEffect(() => {
        setCanProceed(false)
        setSelectedArr({ index: 0, values: statBlocks[0], usedIndices: [] })
        resetAssignedStats()
    }, [])

    /**
     * Check stat allocations to see if the user can proceed to next step.
     */
    useEffect(() => {
        if (assignedStats.length > 0 && assignedStats.every(s => s.value !== null)) {
            if (ancestryStatBonuses.length === 0 || (ancestryStatBonuses.length === bonusStats.length)) {
                setCanProceed(true)
            }
        }
    }, [assignedStats, bonusStats])

    /**
     * Clear out any bonuses assigned to a maxed-out stat.
     */
    useEffect(() => {
        assignedStats.filter(stat => stat.value === 7).forEach(stat => {
            setBonusStats([...bonusStats.filter(b => b.stat !== stat.stat)])
        })
    }, [assignedStats])

    const onSelectStatArray = useCallback((index: number) => {
        setSelectedArr({ index: index, values: statBlocks[index], usedIndices: []})
        resetAssignedStats()
    }, [])

    const randomizeStatBlockSelection = useCallback(async () => {
        const randomIndex = (await new Roll(`1d${statBlocks.length}`).evaluate()).total - 1
        setSelectedArr({ index: randomIndex, values: statBlocks[randomIndex], usedIndices: [] })
        resetAssignedStats()
    }, [])

    const onSelectBonusStat = useCallback((bonus: string) => {
        const split = bonus.split(",")
        const bonusStat = { stat: split[0], name: split[2], bonus: Number(split[1]) }
        console.log(bonus, bonusStat)
        if (bonusStats.length === 0) {
            setBonusStats([bonusStat])
        }
        else {
            setBonusStats(bonusStats.map(b => {
                if (b.name === bonusStat.name) return bonusStat
                else return b
            }))
        }
    }, [bonusStats])

    const onDragStart = (e: React.DragEvent, value: number, poolIndex: number) => {
        e.stopPropagation()
        e.dataTransfer.effectAllowed = "move"
        const payload = {
            type: "VgLiteStatBlock",
            value: value,
            poolIndex: poolIndex
        }
        e.dataTransfer.setData("text/plain", JSON.stringify(payload))
    }

    const onDragDrop = (e: React.DragEvent, targetStatKey: string) => {
        e.preventDefault()
        e.stopPropagation()
        const rawData = e.dataTransfer.getData("text/plain")
        if (!rawData) return
        const payload = JSON.parse(rawData)
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

    const CoreStats = () => {
        return (
            <div className="bg-sheet-main-fill space-y-4">
                {/* HEADER AND NAVIGATION BUTTONS */}
                <NavButtons header={<Header title={strings.coreStats} />} />

                <div className="w-full space-y-2 items-center justify-center text-center">
                    {/* STAT ARRAY HEADER */}
                    <HeroCreationLabel text={strings.statArrayPool} />
                    <HeroCreationSubtext text={strings.statArrayDrag} />

                    {/* STAT POOL SELECTION */}
                    <div className="flex gap-x-4 justify-center items-end">
                        <div>
                            <SecondaryButton
                                icon={assignedStats.some(stats => stats.value != null) ? <Undo size={14} /> : <Dices size={14} />}
                                children={
                                    assignedStats.some(stats => stats.value != null) ?
                                        <p className="font-paradigm font-bold">{strings.statsReset}</p> :
                                        <p className="font-paradigm font-bold">{strings.statsRoll}</p>
                                }
                                onClick={assignedStats.some(stats => stats.value != null) ?
                                    resetAssignedStats :
                                    randomizeStatBlockSelection
                                }
                            />
                        </div>

                        {/* STAT ARRAY DROPDOWN SELECTOR */}
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

                    <div className="justify-center">
                        {/* SELECTED STAT POOL DRAGABLES */}
                        <div className="flex w-fit gap-x-2 p-2 mx-auto justify-center border border-solid border-table-border rounded-md">
                            {
                                selectedArr?.values?.map((it, index) => {
                                    const isUsed = selectedArr.usedIndices.includes(index)
                                    return (
                                        <DraggableStatBlock
                                            key={index}
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
                        <div className="grid grid-cols-[repeat(3,100px)] justify-center text-center gap-4 px-8 mt-2 mb-4">
                            {
                                Object.keys(stats).map((statKey) => {
                                    const currentAssignment = assignedStats.find(item => item.stat === statKey)
                                    return (
                                        <StatDragTarget
                                            key={statKey}
                                            stat={statKey}
                                            stats={stats}
                                            isKeyStat={clazz?.keyStats?.includes(statKey)}
                                            onDragDrop={onDragDrop}
                                            currentAssignment={currentAssignment}
                                            dragOverStat={dragOverKey}
                                            setDragOverStat={setDragOverStat}
                                            bonusStats={bonusStats}
                                        />
                                    )
                                })
                            }
                        </div>
                    </div>

                    {/* CONDITIONAL STAT BONUS SELECTION */}
                    {
                        ancestryStatBonuses.length === 0 ? <></> :
                            <div className="flex w-fit gap-x-2 gap-y-1 py-2 px-8 mx-auto justify-center border border-solid border-table-border rounded-md">
                                {ancestryStatBonuses.map((mod, index) => (
                                    <div key={index}>
                                        <HeroCreationDropdown
                                            label={mod.name}
                                            value={`${bonusStats[index]?.stat},${bonusStats[index]?.bonus},${bonusStats[index]?.name}`}
                                            options={[{ value: ',,,', label: '-' }, ...assignedStats.filter(s => !s.value || s.value < 7).map(s => (
                                                { value: `${s.stat},${mod.bonus},${mod.name}`, label: `${vgLiteLang.Stat[s.stat].name} (+${mod.bonus})` }
                                            ))]}
                                            onChange={onSelectBonusStat}
                                        />
                                    </div>
                                ))}
                            </div>
                    }

                    {/* VITAL STATS PREVIEW */}
                    <div className="justify-center">
                        <HeroCreationLabel text={strings.vitals} />
                        <Divider />
                        <div className="flex gap-x-2 mt-1 justify-center">
                            <div className="bg-text-hp-max/20 rounded-md border border-solid border-text-hp-current p-4">
                                <HeroCreationSubtext text={strings.maxhp} />
                                <p className="text-4xl text-text-hp-current font-bold">{`${(assignedStats.find(s => s.stat === 'might')?.value ?? 0) * 2}`}</p>
                            </div>
                            <div className="bg-mana/20 rounded-md border border-solid border-mana p-4">
                                <HeroCreationSubtext text={strings.maxmana} />
                                <p className="text-4xl text-mana font-bold">{`
                                ${calculateManaValues(1, assignedStats.find(s => s.stat === clazz?.maxManaStat)?.value ?? 0, clazz).max}
                            `}</p>
                            </div>
                            <div className="bg-mana/20 rounded-md border border-solid border-mana p-4">
                                <HeroCreationSubtext text={strings.maxcast} />
                                <p className="text-4xl text-mana font-bold">{`
                                ${calculateManaValues(1, assignedStats.find(s => s.stat === clazz?.maxManaStat)?.value ?? 0, clazz).maxCast}
                            `}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return { CoreStats, assignedStats, bonusStats }
}