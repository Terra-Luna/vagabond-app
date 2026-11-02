import { Dices, Shuffle, Undo } from "lucide-react"
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react"

import { AncestryDataModel } from "../../../model/item/character/AncestryDataModel"
import { ClassDataModel } from "../../../model/item/character/ClassDataModel"
import { getFlatStatBonuses, getStatChoiceRules } from "../../../rules/util/item-rules-util"
import { appLang } from "../../../utils/lang"
import { tableBorderRounded } from "../../../view/common/border-styles"
import { SecondaryButton } from "../../../view/component/Button"
import { Header } from "../../../view/component/Header"
import { BorderedContent } from "../component/BorderedContent"
import { DraggableStatBlock } from "../component/DraggableStatBlock"
import { HeroCreationDropdown } from "../component/HeroCreationDropdown"
import { HeroCreationLabel, HeroCreationLabeledField, HeroCreationSubtext } from "../component/HeroCreationTypography"
import { StatDragTarget } from "../component/StatDragTarget"
import { TopNavButtons } from "../component/TopNavButtons"

export const useCoreStats = (ancestry: (Item & { system: AncestryDataModel }) | undefined, clazz: (Item & { system: ClassDataModel }) | undefined, navButtons: ReactNode[]) => {
    const STAT_MAX = 7
    const strings = appLang.HeroCreation
    const stats = appLang.Stat
    const statBlocks = appLang.BaseStatBlocks

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
        setSelectedArr({ index: index, values: statBlocks[index], usedIndices: [] })
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
    const onDragStart = (e: React.DragEvent, value: number, poolIndex: number, sourceStat?: string) => {
        e.stopPropagation()
        e.dataTransfer.effectAllowed = "move"
        const payload = {
            type: "VagabondStatBlock",
            value: value,
            poolIndex: poolIndex,
            sourceStat
        }
        e.dataTransfer.setData("text/plain", JSON.stringify(payload))
    }

    const fitsStat = (stat: string, value: number) =>
        value + getFlatBonusByStat(stat) + getSelectedBonusByStat(stat) <= STAT_MAX

    const onDragDrop = (e: React.DragEvent, targetStatKey: string) => {
        e.preventDefault()
        e.stopPropagation()
        const rawData = e.dataTransfer.getData("text/plain")
        if (!rawData) return
        const payload = JSON.parse(rawData)
        if (payload.type !== "VagabondStatBlock") return

        const { value, poolIndex, sourceStat } = payload
        const target = assignedStats.find(item => item.stat === targetStatKey)

        if (sourceStat) {
            if (sourceStat === targetStatKey) return
            const source = assignedStats.find(item => item.stat === sourceStat)
            if (!source || source.value === null) return
            if (!fitsStat(targetStatKey, source.value)) return
            if (target?.value != null && !fitsStat(sourceStat, target.value)) return

            setAssignedStats(prev => prev.map(item => {
                if (item.stat === targetStatKey) return { ...item, value: source.value, poolIndex: source.poolIndex }
                if (item.stat === sourceStat) return { ...item, value: target?.value ?? null, poolIndex: target?.poolIndex ?? null }
                return item
            }))
            return
        }

        if (!fitsStat(targetStatKey, value)) return

        const returnedIndex = target?.poolIndex
        setSelectedArr(curr => {
            if (!curr) return curr
            let updatedUsed = [...curr.usedIndices, poolIndex]
            if (returnedIndex !== null && returnedIndex !== undefined) {
                updatedUsed = updatedUsed.filter(idx => idx !== returnedIndex)
            }
            return { ...curr, usedIndices: updatedUsed }
        })
        setAssignedStats(prev => prev.map(item => item.stat === targetStatKey ? { ...item, value, poolIndex } : item))
    }

    const randomlyAssignStats = () => {
        if (!selectedArr) return
        const statKeys = Object.keys(stats)
        const indices = selectedArr.values.map((_, i) => i)
        for (let attempt = 0; attempt < 100; attempt++) {
            for (let i = indices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [indices[i], indices[j]] = [indices[j], indices[i]]
            }
            if (!statKeys.every((stat, k) => fitsStat(stat, selectedArr.values[indices[k]]))) continue

            setAssignedStats(statKeys.map((stat, k) => ({ stat, value: selectedArr.values[indices[k]], poolIndex: indices[k] })))
            setSelectedArr({ ...selectedArr, usedIndices: [...indices] })
            return
        }
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
                <HeroCreationSubtext text={strings.statArrayDrag} />

                {/* STAT POOL SELECTION */}
                <div className="flex gap-x-2 justify-center items-end">

                    <SecondaryButton
                        icon={assignedStats.some(stats => stats.value != null) ? <Undo size={14} /> : <Dices size={14} />}
                        children={
                            assignedStats.some(stats => stats.value != null)
                                ? <p className="font-paradigm">{strings.statsReset}</p>
                                : <p className="font-paradigm">{strings.statsRoll}</p>
                        }
                        onClick={assignedStats.some(stats => stats.value != null)
                            ? resetAssignedStats
                            : randomizeStatBlockSelection
                        }
                    />

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

                    <div className="ml-45">
                        <SecondaryButton
                            icon={<Shuffle size={14} />}
                            children={<p className="font-paradigm">{strings.statsRandomAssign}</p>}
                            onClick={randomlyAssignStats}
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
                    <div className="grid grid-cols-[repeat(3,140px)] justify-center text-center gap-4 px-8 mt-2 mb-4">
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
                                        onDragStart={onDragStart}
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

                {/* BONUS STAT CHOICE SELECTION + FLAT BONUSES + MAX HP */}
                <div className="flex gap-x-4 justify-center items-center flex-wrap">
                    {requiredChoiceRules.length > 0 && (
                        <div className={`flex flex-col w-fit gap-y-2 py-2 px-8 justify-center bg-sheet-main-fill ${tableBorderRounded}`}>
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
                    <div className="flex gap-x-2 justify-center items-center">
                        {flatStatBonuses.length > 0 &&
                            <BorderedContent className="flex-col">
                                <HeroCreationLabel text={strings.flatBonus} />
                                <div className="flex gap-x-2">
                                    {flatStatBonuses.map((b, index) => (
                                        <HeroCreationLabeledField key={index} label={b.name} value={`${appLang.Stat[b.stat].name} +${b.bonus}`} />
                                    ))}
                                </div>
                            </BorderedContent>
                        }

                        {/* MAX HP DISPLAY */}
                        <div className="flex gap-x-2 justify-center">
                            <div className="bg-text-hp-max/20 rounded-md border border-solid border-text-hp-current p-2">
                                <HeroCreationSubtext text={strings.maxhp} />
                                <p className="text-4xl text-text-hp-current font-bold">
                                    {`${((assignedStats.find(s => s.stat === 'might')?.value ?? 0) + getFlatBonusByStat('might') + getSelectedBonusByStat('might'))}`}
                                </p>
                            </div>
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