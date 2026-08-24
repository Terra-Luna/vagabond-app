import { LockKeyhole } from "lucide-react"
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react"

import { statsSchema } from "../../../model/actor/type/Stats"
import { AncestryDataModel } from "../../../model/item/character/AncestryDataModel"
import { ClassDataModel } from "../../../model/item/character/ClassDataModel"
import { perkPrerequisites } from "../../../model/item/character/PerkDataModel"
import { getItemChoiceRules, getItemGrants, ItemRule } from "../../../rules/util/item-rules-util"
import { ItemsCache } from "../../../rules/util/ItemsCache"
import { vgLiteLang } from "../../../utils/lang"
import { Header } from "../../../view/component/Header"
import { SkillCard } from "../../../view/component/SkillCard"
import { EditModeContextProvider } from "../../../view/context/EditModeContext/EditModeContext"
import { EditModeOptions } from "../../../view/context/EditModeContext/EditModeOptions"
import { BonusChoiceTitle } from "../component/BonusChoiceContaner"
import { TopNavButtons } from "../component/TopNavButtons"

export const usePerkSelection = (
    ancestry: Item & { system: AncestryDataModel } | undefined,
    clazz: Item & { system: ClassDataModel } | undefined,
    stats: ReturnType<typeof statsSchema>,
    trainings: string[],
    spells: string[],
    navButtons: ReactNode[],
    level: number,
    lockAncestrySlots: boolean = false
) => {

    const allPerks = useMemo(() => {
        return [...ItemsCache.perks()]
    }, [])

    /**
     * A list of every perk in the game that is eligible for selection by the hero, based on their current stats, trainings, and spells.
     */
    const selectablePerks = useMemo(() => {
        const perks = [...allPerks.map(perk => toDisplayablePerk(perk))]
        return perks
    }, [allPerks])

    /**
     * A list of every perk in the game.
     */
    const perksList = useMemo(() => {
        return [
            { value: '', label: strings.emptySlot, img: '', prereqs: [], cardSubheader: [], description: '', multi: false },
            ...selectablePerks
        ]
    }, [selectablePerks])

    /**
     * Constructs a seperate list of perks the hero is eligible so far
     * base on stat, spell, and training selections.
     */
    const eligiblePerksList = useMemo(() => {
        return [
            { value: '', label: strings.emptySlot, img: '', prereqs: [], cardSubheader: [], description: '' },
            ...ItemsCache.eligiblePerks(stats, trainings, spells)
                .filter(it => selectablePerks.some(sp => sp.value === it.uuid))
                .map(perk => toDisplayablePerk(perk))
        ]
    }, [stats, trainings, spells, selectablePerks])

    /**
     * Monitor the selected class and construct a list of filtered perk choices based
     * on their perk choice filter rules.
     */
    const classRestrictedPerksLists = useMemo(() => {
        const perkRules = getItemChoiceRules(level, clazz?.system?.rules?.filter(r => (r as any).level <= 1) ?? []).filter(it => it.pack === "perk")
        return Object.fromEntries(perkRules.map(rule => [rule.id, [
            { value: '', label: strings.emptySlot, img: '', prereqs: [], cardSubheader: [], description: '' },
            ...ItemsCache.perks()
                .filter(perk => rule.choices.some(choice => choice.value === perk.uuid))
                .map(perk => toDisplayablePerk(perk))
        ]]))
    }, [level, clazz])

    // Perks automatically granted by chosen Ancestry & Class.
    const [ancestryPerkGrants, setAncestryPerkGrants] = useState<(ItemRule & { item: string, uuid: string, source: string })[]>([])
    const [classPerkGrants, setClassPerkGrants] = useState<(ItemRule & { item: string, uuid: string, source: string })[]>([])

    // Player's chosen perks for each slot type.
    const [ancestryPerkSlots, setAncestryPerkSlots] = useState<{ value: string, label: string, ruleName: string, ruleId: string, selectionId: string }[]>([])
    const [classPerkSlots, setClassPerkSlots] = useState<{ value: string, label: string, ruleName: string, ruleId: string, selectionId: string, level: number }[]>([])

    // Dependency items for useEffect to load initial perk selections only once per ancestry/class/level combination.
    const ancestryId = ancestry?.id
    const classId = clazz?.id

    useEffect(() => {
        getItemGrants('perk', [ancestry]).then(grants => {
            setAncestryPerkGrants(grants)  
        })

        setAncestryPerkSlots(loadInitialSlots(
            getItemChoiceRules(level, ancestry?.system?.rules?.filter(r => (r as any).level <= level) ?? []).filter(it => it.pack === "perk")
        ))

        getItemGrants('perk', [clazz]).then(grants => {
            setClassPerkGrants(grants)
        })

        setClassPerkSlots(loadInitialSlots(
            getItemChoiceRules(level, clazz?.system?.rules?.filter(r => (r as any).level <= level) ?? []).filter(it => it.pack === "perk")
        ))
    }, [ancestryId, classId])

    /**
     * Prepares the perk data for display in the perk selection list.
     * @param rules 
     * @returns 
     */
    const loadInitialSlots = (rules) => {
        const perkRules = rules.filter(r => r.pack === 'perk')
        const slots = perkRules.flatMap(rule => {
            const count = Number(rule.maxChoices) || 0
            const currentName = rule.label
            const currentId = rule.id
            return Array.from({ length: count }, () => ({
                value: '',
                label: strings.emptySlot,
                ruleName: currentName,
                ruleId: currentId,
                selectionId: foundry.utils.randomID(),
                level: rule.level
            }))
        })
        return slots
    }

    const onSelectPerk = useCallback((selectedSlot: any, perk: string, perkId: string, setter: any) => {
        setter(prevSlots =>
            prevSlots.map(slot =>
                slot === selectedSlot ? { ...slot, label: perk, value: perkId } : slot
            )
        )
    }, [])

    const isAllSelected = useMemo(() => {
        return ![...ancestryPerkSlots, ...classPerkSlots].some(slot => slot.value.length === 0)
    }, [ancestryPerkSlots, classPerkSlots])

    const stackablePerkIds = useMemo(() => new Set(
        allPerks.filter(perk => perk.system.canTakeMultiple).map(perk => perk.uuid)
    ), [allPerks])

    const selectedPerkIds = useMemo(() => new Set(
        [...ancestryPerkSlots, ...classPerkSlots].map(slot => slot.value).filter(Boolean)
    ), [ancestryPerkSlots, classPerkSlots])

    const getPerkOption = useCallback((perkId: string) => {
        return selectablePerks.find(perk => perk.value === perkId)
    }, [selectablePerks])

    const getSlotOptions = useCallback((slot: { ruleId: string, value: string }) => {
        const restrictedOptions = classRestrictedPerksLists[slot.ruleId]
        if (restrictedOptions) return restrictedOptions
        return eligiblePerksList
    }, [classRestrictedPerksLists, eligiblePerksList])

    const getSlotLabel = useCallback((slot: { ruleName: string }) => slot.ruleName || strings.perksHeader, [])

    const notifyInvalidDrop = useCallback((slot: { ruleId: string, ruleName: string }, perkId: string) => {
        const restrictedOptions = classRestrictedPerksLists[slot.ruleId]
        const perkName = ItemsCache.perks().find(p => p.uuid === perkId)?.name ?? 'Unknown Perk'
        if (restrictedOptions && !restrictedOptions.some(option => option.value === perkId)) {
            ui.notifications?.warn(`${perkName} is not eligible for ${slot.ruleName}. This slot requires its configured class feature restriction.`)
            return
        }
        if (!eligiblePerksList.some(option => option.value === perkId)) {
            ui.notifications?.warn(`Hero does not meet prerequisites for: ${perkName}.`)
        }
    }, [classRestrictedPerksLists, eligiblePerksList, getPerkOption])

    const renderPerkCard = useCallback((perk: any, draggable = false) => (
        <div
            key={perk.value}
            draggable={draggable}
            onDragStart={draggable ? event => {
                event.stopPropagation()
                event.dataTransfer.effectAllowed = "copy"
                event.dataTransfer.setData("application/x-vagabond-perk", perk.value)
                event.dataTransfer.setData("text/plain", perk.value)
            } : undefined}
            onDragEnd={draggable ? event => {
                event.stopPropagation()
                event.dataTransfer.clearData()
            } : undefined}
            className={draggable ? "cursor-grab active:cursor-grabbing" : ""}
        >
            <SkillCard
                img={perk.img}
                title={perk.label}
                subtitles={perk.cardSubheader}
                description={perk.description}
                startCollapsed={true}
            />
        </div>
    ), [])

    const [activeSlot, setActiveSlot] = useState<any>()
    const [isSlotFilterEnabled, setIsSlotFilterEnabled] = useState(true)

    /**
     * Perk slot drag/drop target containers.
     */
    const renderSlot = useCallback((slot: any, slotIndex: number, setter: any, slotType: string, bonusChoices: Record<string, ReactNode>, locked = false) => {
        const selectedPerk = getPerkOption(slot.value)
        const options = getSlotOptions(slot)

        const toggleFilter = useCallback((slot) => {
            if (activeSlot === slot) {
                setIsSlotFilterEnabled(enabled => !enabled)
            }
            else {
                setActiveSlot(slot)
                setIsSlotFilterEnabled(true)
            }
        }, [])

        return (
            <div
                key={`${slotType}-${slot.ruleId}-${slotIndex}`}
                className={`bg-context-menu-fill/50 border border-table-border rounded-sm p-2 ${locked ? "" : "cursor-pointer"} ${slot.value ? "border-solid" : "border-dashed"}`}
                onClick={locked ? undefined : () => toggleFilter(slot)}
                onDragOver={locked ? undefined : event => {
                    event.preventDefault()
                    event.stopPropagation()
                    event.dataTransfer.dropEffect = "copy"
                }}
                onDragEnter={locked ? undefined : event => {
                    event.preventDefault()
                    event.stopPropagation()
                }}
                onDrop={locked ? undefined : event => {
                    event.preventDefault()
                    event.stopPropagation()
                    const perkId = event.dataTransfer.getData("application/x-vagabond-perk") || event.dataTransfer.getData("text/plain")
                    if (!perkId) return
                    if (!options.some(option => option.value === perkId)) {
                        notifyInvalidDrop(slot, perkId)
                        return
                    }
                    onSelectPerk(slot, getPerkOption(perkId)?.label ?? perkId, perkId, setter)
                    setActiveSlot(undefined)
                }}
            >
                {/* PERK SLOT LABEL */}
                <div className="flex items-center justify-between gap-x-2 mb-2">
                    <p className="font-eskapade font-bold text-text-primary">{getSlotLabel(slot)}</p>
                    {!slot.value && <span className="text-sm text-text-secondary">Empty perk slot</span>}
                    {locked && <LockKeyhole size={14} className="text-text-tertiary" />}
                </div>
                {selectedPerk
                    ? (
                        <div className="cursor-default" onClick={(e) => e.stopPropagation()}>
                            {renderPerkCard(selectedPerk)}
                            <EditModeContextProvider initialEditMode={locked || !slot.value ? EditModeOptions.FALSE : EditModeOptions.TRUE}>
                                {bonusChoices[slot.selectionId]}
                            </EditModeContextProvider>
                        </div>
                    )
                    : <div className="min-h-12 p-2 border border-dashed border-table-border flex items-center justify-center text-text-tertiary italic">
                        {locked ? "Granted by Ancestry" : "Drop perk here (click to toggle filter)"}
                    </div>
                }
            </div>
        )
    }, [activeSlot, getPerkOption, getSlotLabel, getSlotOptions, notifyInvalidDrop, onSelectPerk, renderPerkCard])

    const grantedPerkIds = useMemo(() => new Set(
        [...ancestryPerkGrants, ...classPerkGrants].map(grant => grant.uuid)
    ), [ancestryPerkGrants, classPerkGrants])

    const availablePerks = useMemo(() => {
        const targetOptions = isSlotFilterEnabled
            ? (activeSlot ? getSlotOptions(activeSlot) : eligiblePerksList)
            : perksList
        return targetOptions
            .filter(perk => perk.value)
            .filter(perk => !grantedPerkIds.has(perk.value))
            .filter(perk => stackablePerkIds.has(perk.value) || !selectedPerkIds.has(perk.value))
    }, [activeSlot, getSlotOptions, eligiblePerksList, grantedPerkIds, isSlotFilterEnabled, perksList, selectedPerkIds, stackablePerkIds])

    const PerkSelection = ({ bonusChoices = {} }: { bonusChoices?: Record<string, ReactNode> } = {}) =>
        <div className="bg-sheet-main-fill flex flex-col h-full min-h-0 overflow-hidden space-y-2">
            {/* FIXED HEADER AND NAVIGATION BUTTONS */}
            <div className="flex flex-col gap-4 flex-shrink-0">
                <Header title={strings.perksHeader} />
                <TopNavButtons navButtons={navButtons} canProceed={isAllSelected} />
            </div>

            {/* SCROLLABLE CONTENT CONTAINER */}
            <div className="flex-1 flex flex-col min-h-0 w-full justify-center mx-auto">

                {/* INDEPENDENTLY SCROLLING PANELS */}
                <div className="grid grid-cols-2 gap-2 items-start flex-1 min-h-0 mt-2">
                    {/* LEFT-SIDE PANEL: AVAILABLE PERKS LIST */}
                    <div className="flex flex-col h-full min-h-0 space-y-1">
                        <div className="flex-shrink-0">
                            <BonusChoiceTitle text={activeSlot && isSlotFilterEnabled
                                ? `Eligible Perks: ${getSlotLabel(activeSlot)}`
                                : "All Available Perks"
                            } />
                            <div className="flex flex-col text-sm text-text-secondary">
                                <span>
                                    Filter: <span className="font-bold">{isSlotFilterEnabled ? "ON" : "OFF"}</span>
                                </span>
                                <p>Click slot to toggle</p>
                            </div>
                        </div>
                        {/* SCROLLABLE PERK OPTIONS */}
                        <div className="flex-1 overflow-y-auto min-h-0 space-y-1">
                            {availablePerks.map(perk => renderPerkCard(perk, true))}
                        </div>
                    </div>

                    {/* RIGHT-SIDE PANEL: PERK SLOTS */}
                    <div className="flex flex-col h-full min-h-0 overflow-y-auto">
                        <div className="space-y-1">
                            {/* GRANTED PERKS */}
                            <div className="mb-4">
                                {[...ancestryPerkGrants, ...classPerkGrants].length > 0 &&
                                    <div className="space-y-1 flex-shrink-0">
                                        <BonusChoiceTitle text={strings.grantedPerks} />
                                    {[...ancestryPerkGrants, ...classPerkGrants].map((grant, index) => (
                                        renderSlot({ value: grant.uuid, label: grant.item, ruleName: grant.source, ruleId: grant.id }, index, () => { }, "granted", bonusChoices, true)
                                    ))}
                                </div>
                                }
                            </div>
                            {/* PERK SLOTS - DRAG-DROPPABLE */}
                            <BonusChoiceTitle text="Perk Slots" />
                            {ancestryPerkSlots.map((slot, index) => renderSlot(slot, index, setAncestryPerkSlots, "ancestry", bonusChoices, lockAncestrySlots))}
                            {classPerkSlots.map((slot, index) => renderSlot(slot, index, setClassPerkSlots, "class", bonusChoices))}
                        </div>
                    </div>
                </div>
            </div>
        </div>

    return {
        PerkSelection, ancestryPerkSlots, classPerkSlots, allPerks, perksList,
        setAncestryPerkSlots, setClassPerkSlots, loadInitialSlots
    }
}

const strings = vgLiteLang.HeroCreation

const toDisplayablePerk = (perk) => {
    return {
        value: perk.uuid,
        label: perk.name,
        img: perk.img ?? '',
        prereqs: (perk.system as any)?.prerequisites,
        multi: perk.system.canTakeMultiple,
        cardSubheader: perkPrerequisites(perk.system as any),
        description: perk.system.description
    }
}