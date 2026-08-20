import { ReactNode, useCallback, useEffect, useMemo, useState } from "react"
import { AncestryDataModel } from "../../../model/item/character/AncestryDataModel"
import { ClassDataModel } from "../../../model/item/character/ClassDataModel"
import { vgLiteLang } from "../../../utils/lang"
import { Header } from "../../../view/component/Header"
import { HeroCreationLabel, HeroCreationSuccessMessage } from "../component/HeroCreationTypography"
import { getItemChoiceRules, getItemGrants, ItemRule } from "../../../rules/util/item-rules-util"
import { perkPrerequisites } from "../../../model/item/character/PerkDataModel"
import { SkillCard } from "../../../view/component/SkillCard"
import { ItemGrantCard } from "../component/ItemGrantCard"
import { BonusChoiceContainer, BonusChoiceTitle } from "../component/BonusChoiceContaner"
import { ItemSelectorGroup } from "../component/ItemSelectorGroup"
import { TopNavButtons } from "../component/TopNavButtons"
import { ItemsCache } from "../../../rules/util/ItemsCache"
import { statsSchema } from "../../../model/actor/type/Stats"
import { Checkbox } from "../../../view/component/Checkbox"
import { EditModeContextProvider } from "../../../view/context/EditModeContext/EditModeContext"
import { EditModeOptions } from "../../../view/context/EditModeContext/EditModeOptions"
import { groupBy } from "../../../utils/collectionUtil"

export const usePerkSelection = (
    ancestry: Item & { system: AncestryDataModel } | undefined,
    clazz: Item & { system: ClassDataModel } | undefined,
    stats: ReturnType<typeof statsSchema>,
    trainings: string[],
    spells: string[],
    navButtons: ReactNode[],
    level: number,
    isLevelUp?: boolean
) => {
    const isCreationMode = navButtons.length > 0
    const adjLevel = level + (isLevelUp ? 1 : 0)
    /**
     * A list of every perk in the game.
     */
    const perksList = useMemo(() => {
        return [
            { value: '', label: strings.emptySlot, img: '', prereqs: [], cardSubheader: [], description: '', multi: false },
            ...ItemsCache.perks().map(perk => toDisplayablePerk(perk))
        ]
    }, [])

    /**
     * Constructs a seperate list of perks the hero is eligible so far
     * base on stat, spell, and training selections.
     */
    const eligiblePerksList = useMemo(() => {
        return [
            { value: '', label: strings.emptySlot, img: '', prereqs: [], cardSubheader: [], description: '' },
            ...ItemsCache.eligiblePerks(stats, trainings, spells).map(perk => toDisplayablePerk(perk))
        ]
    }, [stats, trainings, spells])

    /**
     * Monitor the selected class and construct a list of filtered perk choices based
     * on their perk choice filter rules.
     */
    const classRestrictedPerksList = useMemo(() => {
        const perkRules = getItemChoiceRules(adjLevel, clazz?.system?.rules?.filter(r => (r as any).level <= 1) ?? []).filter(it => it.pack === "perk")
        const filteredChoices = perkRules.flatMap(it => it.choices).map(it => it.value)
        return [
            { value: '', label: strings.emptySlot, img: '', prereqs: [], cardSubheader: [], description: '' },
            ...ItemsCache.perks().filter(it => filteredChoices.includes(it.uuid)).map(perk => toDisplayablePerk(perk))
        ]
    }, [clazz])

    // All perks for selection.
    const [useEligibilityFilter, setUseEligibilityFilter] = useState<boolean>(true)

    // Perks automatically granted by chosen Ancestry & Class.
    const [ancestryPerkGrants, setAncestryPerkGrants] = useState<(ItemRule & { item: string, uuid: string, source: string })[]>([])
    const [classPerkGrants, setClassPerkGrants] = useState<(ItemRule & { item: string, uuid: string, source: string })[]>([])

    // Player's chosen perks for each slot type.
    const [ancestryPerkSlots, setAncestryPerkSlots] = useState<{ value: string, label: string, ruleName: string, ruleId: string }[]>([])
    const [classPerkSlots, setClassPerkSlots] = useState<{ value: string, label: string, ruleName: string, ruleId: string, level: number, isLocked: boolean }[]>([])

    useEffect(() => {
        getItemGrants('perk', [ancestry]).then(grants => {
            setAncestryPerkGrants(grants)  
        })

        setAncestryPerkSlots(loadInitialSlots(
            getItemChoiceRules(adjLevel, ancestry?.system?.rules?.filter(r => (r as any).level <= level) ?? []).filter(it => it.pack === "perk")
        ))

        getItemGrants('perk', [clazz]).then(grants => {
            setClassPerkGrants(grants)
        })

        setClassPerkSlots(loadInitialSlots(
            getItemChoiceRules(adjLevel, clazz?.system?.rules?.filter(r => (r as any).level <= level) ?? []).filter(it => it.pack === "perk")
        ))
    }, [ancestry, clazz])

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
                level: rule.level
            }))
        })
        return slots
    }

    const onSelectPerk = useCallback((slotIndex: number, perk: string, perkId: string, setter: any) => {
        setter(prevSlots =>
            prevSlots.map((slot, index) =>
                index === slotIndex ? { ...slot, label: perk, value: perkId, isLocked: false } : slot
            )
        )
    }, [])

    const isAllSelected = useMemo(() => {
        return ![...ancestryPerkSlots, ...classPerkSlots].some(slot => slot.value.length === 0)
    }, [ancestryPerkSlots, classPerkSlots])

    const groupedClassPerkSlots = useMemo(() => groupBy("ruleName", [...classPerkSlots]), [classPerkSlots])

    const PerkSelection =
        <div className="@container bg-sheet-main-fill space-y-4">
            {/* HEADER AND NAVIGATION BUTTONS */}
            <Header title={strings.perksHeader} />
            <TopNavButtons navButtons={navButtons} canProceed={isAllSelected} />

            <div className="flex flex-col w-full justify-center">
                <div className="inline-flex flex-col items-stretch space-y-4 @2xl:w-1/2 mx-auto">
                    {isAllSelected && !isLevelUp && <HeroCreationSuccessMessage text={strings.allPerksSelected} />}

                    {/* GRANTED PERKS */}
                    {[...ancestryPerkGrants, ...classPerkGrants].length > 0 &&
                        <div className="mt-4 space-y-1">
                            <HeroCreationLabel text={strings.grantedPerks} />
                            {[...ancestryPerkGrants, ...classPerkGrants].map((grant, index) => (
                                <ItemGrantCard key={index} img={ItemsCache.perks().find(p => p.uuid === grant.uuid)?.img ?? ''} name={grant.item} source={grant.source} />
                            ))}
                            {!isCreationMode && <>
                                {ancestryPerkSlots.map((slot, index) => (
                                    <ItemGrantCard key={index} img={ItemsCache.perks().find(p => p.uuid === slot.value)?.img ?? ''} name={slot.label} source={slot.ruleName} />
                                ))}
                            </>}
                        </div>
                    }

                    {/* CHOOSE CLASS PERKS */}
                    {classPerkSlots.length > 0 &&
                        <div className="flex flex-col gap-y-4">
                            {Object.keys(groupedClassPerkSlots).map((key, index) => {
                                const slots = groupedClassPerkSlots[key]
                                const otherClassSlots = Object.keys(groupedClassPerkSlots)
                                    .filter(k => k !== key)
                                    .flatMap(k => groupedClassPerkSlots[k])
                                const indexOffset = Object.keys(groupedClassPerkSlots).indexOf(key)

                                return (
                                    <div key={index} className="flex flex-col">
                                        <BonusChoiceTitle text={key} />
                                        <ItemSelectorGroup
                                            slotGroup={slots}
                                            options={index === 0 ? classRestrictedPerksList : (useEligibilityFilter ? eligiblePerksList : perksList)}
                                            otherSlotGroup={[...ancestryPerkSlots, ...otherClassSlots]}
                                            grants={[...ancestryPerkGrants, ...classPerkGrants].filter(g => !perksList.find(p => p.value === g.uuid)?.multi)}
                                            onSelect={(index, label, selectedId) => onSelectPerk(index + indexOffset, label, selectedId, setClassPerkSlots)}
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    }

                    {/* CHOOSE ANCESTRY PERKS */}
                    {isCreationMode && ancestryPerkSlots.length > 0 &&
                        <BonusChoiceContainer>
                            <div className="flex gap-x-6">
                                <BonusChoiceTitle text={`${ancestry?.name} ${ancestryPerkSlots[0].ruleName}`} />
                            </div>
                            <ItemSelectorGroup
                                slotGroup={ancestryPerkSlots}
                                options={useEligibilityFilter ? eligiblePerksList : perksList}
                                otherSlotGroup={classPerkSlots}
                                grants={[...ancestryPerkGrants, ...classPerkGrants]}
                                onSelect={(index, label, selectedId) => onSelectPerk(index, label, selectedId, setAncestryPerkSlots)}
                            />
                        </BonusChoiceContainer>
                    }

                    {/* CHECKBOX TOGGLE FOR PERK ELIGIBILITY FILTER */}
                    <div className="w-1/3">
                        <EditModeContextProvider initialEditMode={EditModeOptions.TRUE}>
                            <Checkbox label={"Filter eligibility"} onCheckedChanged={(checked) => setUseEligibilityFilter(checked)} checked={useEligibilityFilter} />
                        </EditModeContextProvider>
                    </div>

                    <div className="mt-4 space-y-1">
                        {/* CHOSEN PERKS */}
                        <HeroCreationLabel text={strings.perksList} />
                        {[...classPerkSlots].filter(slot => (slot.value?.length ?? 0) > 0).map((slot, index) => {
                            const perk = perksList.find(p => p.value === slot.value)
                            if (perk) {
                                return (
                                    <SkillCard
                                        key={perk.value + `_${index}`}
                                        img={perk.img}
                                        title={perk.label}
                                        subtitles={perk.cardSubheader}
                                        description={perk.description}
                                    />
                                )
                            }
                            else {
                                return <></>
                            }
                        })}
                    </div>
                </div>
            </div>
        </div>

    return {
        PerkSelection, ancestryPerkSlots, classPerkSlots, perksList,
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