import { Dices, Undo } from "lucide-react"
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react"

import { calculateManaValues } from "../../../model/actor/HeroDataModel"
import { AncestryDataModel } from "../../../model/item/character/AncestryDataModel"
import { ClassDataModel } from "../../../model/item/character/ClassDataModel"
import { getFlatStatBonuses, getStatChoiceRules } from "../../../rules/util/item-rules-util"
import { vgLiteLang } from "../../../utils/lang"
import { SecondaryButton } from "../../../view/component/Button"
import { Divider, Header } from "../../../view/component/Header"
import { BorderedContent } from "../component/BorderedContent"
import { DraggableStatBlock } from "../component/DraggableStatBlock"
import { HeroCreationDropdown } from "../component/HeroCreationDropdown"
import { HeroCreationLabel, HeroCreationLabeledField, HeroCreationSubtext } from "../component/HeroCreationTypography"
import { StatDragTarget } from "../component/StatDragTarget"
import { TopNavButtons } from "../component/TopNavButtons"

export const useCoreStats = (ancestry: (Item & { system: AncestryDataModel }) | undefined, clazz: (Item & { system: ClassDataModel }) | undefined, navButtons: ReactNode[]) => {
    const STAT_MAX = 7
    const strings = vgLiteLang.HeroCreation
    const stats = vgLiteLang.Stat
    const statBlocks = vgLiteLang.BaseStatBlocks

    const lastCanProceedRef = useRef<boolean>(false)
    const [selectedArr, setSelectedArr] = useState<{ index: number, values: number[], usedIndices: number[] }>()
    const [assignedStats, setAssignedStats] = useState<{ stat: string, value: number | null, poolIndex: number | null }[]>([])
    const [bonusStatSelections, setBonusStatSelections] = useState<{ stat: string, id_index: string, bonus: number }[]>([])
    const [dragOverKey, setDragOverStat] = useState<string | null>(null)
    
    const resetAssignedStats = () => {
        setBonusStatSelections([])
        setAssignedStats(Object.keys(stats).map(s => ({ stat: s, value: null, poolIndex: null })))
        setSelectedArr(prev => {
            if (!prev) return prev
            else return { ...prev, usedIndices: [] }
        })
    }

    /**
     * Check Item rule sets for any bonuses to be applied...
     */
    const requiredChoiceRules = useMemo(() => {
        return getStatChoiceRules([ancestry, clazz])
    }, [ancestry, clazz])

    const flatStatBonuses = useMemo(() => {
        return getFlatStatBonuses([ancestry, clazz])
    }, [ancestry, clazz])

    const getSelectedBonusByStat = (stat: string): number => {
        return bonusStatSelections.filter(b => b.stat
            .toLowerCase()
            .replace("stats.", "") === stat)
            .reduce((sum, b) => { return sum + b.bonus }, 0)
    }

    const getFlatBonusByStat = (stat: string): number => {
        return flatStatBonuses.filter(b => b.stat === stat).reduce((sum, b) => { return sum + b.bonus }, 0)
    }

    /**
     * Initialize some states.
     */
    useEffect(() => {
        setSelectedArr({ index: 0, values: statBlocks[0], usedIndices: [] })
        resetAssignedStats()
    }, [])

    /**
     * Check stat allocations and choices to see if the user can proceed.
     */
    useEffect(() => {
        let shouldProceed = false
        if (assignedStats.length > 0 && assignedStats.every(s => s.value !== null)) {
            const totalRequiredSelections = requiredChoiceRules.reduce((sum, r) => sum + (r.maxChoices || 1), 0)
            if (totalRequiredSelections === 0 || (totalRequiredSelections === bonusStatSelections.length)) {
                shouldProceed = true
            }
        }
    }, [assignedStats, bonusStatSelections, requiredChoiceRules])

    /**
     * Automagically clear out any bonuses assigned to a maxed-out stat.
     */
    useEffect(() => {
        // Collect all stat keys that are currently maxed out at 7
        const maxedStatKeys = assignedStats.filter(stat => stat.value === STAT_MAX).map(stat => stat.stat)
        if (maxedStatKeys.length === 0) return
        setBonusStatSelections(prevBonusStats => {
            // Only modify state if there are actual bonuses matching the maxed stats
            const hasMatchingBonus = prevBonusStats.some(b => maxedStatKeys.includes(b.stat))
            if (!hasMatchingBonus) return prevBonusStats
            return prevBonusStats.filter(b => !maxedStatKeys.includes(b.stat))
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

    const onSelectBonusStat = useCallback((newBonus) => {
        setBonusStatSelections(prevStats => {
            const exists = prevStats.some(b => b.id_index === newBonus.id_index)
            if (exists) {
                return prevStats.map(b => b.id_index === newBonus.id_index ? newBonus : b)
            } else {
                return [...prevStats, newBonus]
            }
        })
    }, [])

    /**
     * Drag & Drop handlers for assigning base stats.
     * @param e 
     * @param value 
     * @param poolIndex 
     */
    const onDragStart = (e: React.DragEvent, value: number, poolIndex: number) => {
        e.stopPropagation()
        e.dataTransfer.effectAllowed = "move"
        const payload = {
            type: "VagabondStatBlock",
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
        if (payload.type !== "VagabondStatBlock") return

        const { value, poolIndex } = payload

        if (value + getFlatBonusByStat(targetStatKey) + getSelectedBonusByStat(targetStatKey) > STAT_MAX) {
            return
        }

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

    const CoreStats = (
        <div className="bg-sheet-main-fill flex flex-col h-full min-h-0 overflow-hidden">
            {/* HEADER */}
            <div className="flex-shrink-0 space-y-4">
                <Header title={strings.coreStats} />
                <TopNavButtons navButtons={navButtons} subtitle="" canProceed={!assignedStats.some(s => s.value === null) && (requiredChoiceRules.length === bonusStatSelections.length)} />
            </div>

            <div className="flex-1 overflow-y-auto w-full space-y-2 items-center justify-center text-center">
                {/* STAT ARRAY HEADER */}
                <HeroCreationLabel text={strings.statArrayPool} />

                {/* TODO: DELETE THIS HELPER BUTTON LATER */}
                <div className="flex w-full justify-center">
                    <SecondaryButton onClick={() => {
                        assignedStats.forEach((s, i) => {
                            s.value = selectedArr?.values[i] ?? 2
                        })
                        setAssignedStats([...assignedStats])
                    }} children={<p>AUTO ASSIGN (TEST ONLY)</p>} />
                </div>

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
                    <div className="text-left">
                        <HeroCreationDropdown
                            label={strings.statsSelect}
                            value={selectedArr?.index?.toString() ?? '0'}
                            onChange={onSelectStatArray}
                            options={statBlocks.map((block, index) => (
                                { value: index, label: block.join(", ") + `  [${block.reduce((sum, it) => { return sum + it }, 0)}]` }
                            ))}
                        />
                    </div>
                </div>

                <div className="justify-center">
                    {/* SELECTED STAT POOL DRAGABLES */}
                    <BorderedContent children={
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
                    } />
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
                                        isKeyStat={clazz?.system?.keyStats?.includes(statKey)}
                                        onDragDrop={onDragDrop}
                                        currentAssignment={currentAssignment}
                                        dragOverStat={dragOverKey}
                                        setDragOverStat={setDragOverStat}
                                        bonusStats={bonusStatSelections}
                                        flatStatBonuses={flatStatBonuses}
                                    />
                                )
                            })
                        }
                    </div>
                </div>

                {/* BONUS STAT CHOICE SELECTION */}
                {requiredChoiceRules.length > 0 && (
                    <div className="flex flex-col w-fit gap-y-2 py-2 px-8 mx-auto justify-center border border-solid border-table-border bg-sheet-main-fill rounded-md">
                        {requiredChoiceRules.map((rule) => {
                            const totalChoicesForRule = rule.maxChoices || 1

                            return Array.from({ length: totalChoicesForRule }).map((_, choiceSlotIdx) => {
                                const slotName = `${rule.id}_slot_${choiceSlotIdx}`
                                const currentBonusSelection = bonusStatSelections?.find(b => b.id_index === slotName)
                                const activeStatValue = currentBonusSelection ? currentBonusSelection.stat : ""
                                const availableChoicesArray = rule.choices || []
                                return (
                                    <div key={slotName}>
                                        <HeroCreationDropdown
                                            label={`${rule.label} (${choiceSlotIdx + 1}/${totalChoicesForRule})`}
                                            value={activeStatValue}
                                            options={[
                                                { value: '', label: '-' },
                                                ...availableChoicesArray
                                                    .filter((choice: any) => {
                                                        if (!choice?.value) return false

                                                        // Normalize case path tracking strings to align object keys
                                                        const cleanPath = choice.value.toLowerCase().replace("system.", "")
                                                        const statKey = cleanPath.replace("stats.", "")

                                                        if (cleanPath.startsWith("stats.")) {
                                                            const targetStatObj = assignedStats.find(s => s.stat.toLowerCase() === statKey)
                                                            const existingBonusValue = bonusStatSelections?.find(b => b.stat === choice.value && b.id_index !== slotName)?.bonus ?? 0

                                                            // Keep the option if the pool row has been assigned and doesn't exceed stat max.
                                                            return targetStatObj && (
                                                                !targetStatObj.value ||
                                                                (targetStatObj.value + getFlatBonusByStat(targetStatObj.stat)) <= (STAT_MAX - (rule.value + existingBonusValue))
                                                            )
                                                        }

                                                        return true
                                                    })
                                                    .map((choice: any) => ({
                                                        value: choice.value, // Full db key: "system.stats.might"
                                                        label: `${choice.label} (+${rule.value})`
                                                    }))
                                            ]}
                                            onChange={(selectedStat) => {
                                                if (!selectedStat) {
                                                    setBonusStatSelections(prev => prev.filter(b => b.id_index !== slotName))
                                                } else {
                                                    onSelectBonusStat({
                                                        stat: selectedStat,
                                                        bonus: rule.value,
                                                        id_index: slotName
                                                    })
                                                }
                                            }}
                                        />
                                    </div>
                                )
                            })
                        })}
                    </div>
                )}

                {/* FLAT BONUS STATS LIST */}
                {flatStatBonuses.length > 0 &&
                    <BorderedContent className="flex-col">
                        <HeroCreationLabel text={strings.flatBonus} />
                        <div className="flex gap-x-2">
                            {
                                flatStatBonuses.map((b, index) => (
                                    <HeroCreationLabeledField key={index} label={b.name} value={`${vgLiteLang.Stat[b.stat].name} +${b.bonus}`} />
                                ))
                            }
                        </div>
                    </BorderedContent>
                }

                {/* VITAL STATS PREVIEW */}
                <div className="justify-center">
                    <HeroCreationLabel text={strings.vitals} />
                    <Divider />
                    <div className="flex gap-x-2 mt-1 justify-center">
                        <div className="bg-text-hp-max/20 rounded-md border border-solid border-text-hp-current p-2">
                            <HeroCreationSubtext text={strings.maxhp} />
                            <p className="text-4xl text-text-hp-current font-bold">
                                {`${((assignedStats.find(s => s.stat === 'might')?.value ?? 0) + getFlatBonusByStat('might') + getSelectedBonusByStat('might')) * 2}`}
                            </p>
                        </div>
                        <div className="bg-mana/20 rounded-md border border-solid border-mana p-2">
                            <HeroCreationSubtext text={strings.maxmana} />
                            <p className="text-4xl text-mana font-bold">{`
                            ${calculateManaValues(1, (clazz?.system?.manaMultiplier ?? 0), clazz?.system?.maxCastFormula ?? '').max}
                        `}</p>
                        </div>
                        <div className="bg-mana/20 rounded-md border border-solid border-mana p-2">
                            <HeroCreationSubtext text={strings.maxcast} />
                            <p className="text-4xl text-mana font-bold">{`
                            ${calculateManaValues(1, (clazz?.system?.manaMultiplier ?? 0), clazz?.system?.maxCastFormula ?? '').maxCast}
                        `}</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )

    return {
        CoreStats, selectedArr, assignedStats, bonusStatSelections, flatStatBonuses, resetAssignedStats
    }
}