import { ReactNode, useCallback, useEffect, useState } from "react"
import { AncestryDataModel } from "../../../model/item/character/AncestryDataModel"
import { ClassDataModel } from "../../../model/item/character/ClassDataModel"
import { vgLiteLang } from "../../../utils/lang"
import { Header } from "../../../view/component/Header"
import { HeroCreationLabel, HeroCreationSuccessMessage } from "../component/HeroCreationTypography"
import { getItemChoiceRules, getItemGrants, ItemRule } from "../../../rules/util/item-rules-util"
import { perkPrerequisites } from "../../../model/item/character/PerkDataModel"
import { CardSubHeaderValues, SkillCard } from "../../../view/component/SkillCard"
import { ItemGrantCard } from "../component/ItemGrantCard"
import { BonusChoiceContainer, BonusChoiceTitle } from "../component/BonusChoiceContaner"
import { ItemSelectorGroup } from "../component/ItemSelectorGroup"
import { TopNavButtons } from "../component/TopNavButtons"
import { ItemsCache } from "../../../rules/util/ItemsCache"
import { statsSchema } from "../../../model/actor/type/Stats"
import { Checkbox } from "../../../view/component/Checkbox"

export const usePerkSelection = (
    ancestry: Item & { system: AncestryDataModel } | undefined,
    clazz: Item & { system: ClassDataModel } | undefined,
    stats: ReturnType<typeof statsSchema>,
    trainings: string[],
    spells: string[],
    navButtons: ReactNode[]
) => {
    const strings = vgLiteLang.HeroCreation

    // All perks for selection.
    const [perksList, setPerksList] = useState<{ value: string, label: string, img: string, prereqs: any[], cardSubheader: CardSubHeaderValues[], description: string }[]>([])
    const [eligiblePerksList, setEligiblePerksList] = useState<{ value: string, label: string, img: string, prereqs: any[], cardSubheader: CardSubHeaderValues[], description: string }[]>([])
    const [classRestrictedPerksList, setClassRestrictedPerksList] = useState<{ value: string, label: string, img: string, prereqs: any[], cardSubheader: CardSubHeaderValues[], description: string }[]>([])
    const [useEligibilityFilter, setUseEligibilityFilter] = useState<boolean>(true)

    // Perks automatically granted by chosen Ancestry & Class.
    const [ancestryPerkGrants, setAncestryPerkGrants] = useState<(ItemRule & { item: string, uuid: string, source: string })[]>([])
    const [classPerkGrants, setClassPerkGrants] = useState<(ItemRule & { item: string, uuid: string, source: string })[]>([])

    // Player's chose perks for each slot.
    const [ancestryPerkSlots, setAncestryPerkSlots] = useState<{ value: string, label: string, ruleName: string, ruleId: string }[]>([])
    const [classPerkSlots, setClassPerkSlots] = useState<{ value: string, label: string, ruleName: string, ruleId: string }[]>([])

    const toDisplayablePerk = (perk) => {
        return {
            value: perk.uuid,
            label: perk.name,
            img: perk.img ?? '',
            prereqs: (perk.system as any)?.prerequisites,
            cardSubheader: perkPrerequisites(perk.system as any),
            description: (perk.system as any)?.description
        }
    }

    /**
     * A list of every perk in the game.
     */
    useEffect(() => {
        setPerksList([
            { value: '', label: strings.emptySlot, img: '', prereqs: [], cardSubheader: [], description: '' },
            ...ItemsCache.perks().map(perk => toDisplayablePerk(perk))
        ])
    }, [ItemsCache.perks])

    /**
     * Constructs a seperate list of perks the hero is eligible so far
     * base on stat, spell, and training selections.
     */
    useEffect(() => {
        setEligiblePerksList([
            { value: '', label: strings.emptySlot, img: '', prereqs: [], cardSubheader: [], description: '' },
            ...ItemsCache.eligiblePerks(stats, trainings, spells).map(perk => toDisplayablePerk(perk))
        ])
    }, [stats, trainings, spells])

    /**
     * Monitor the selected class and construct a list of filtered perk choices based
     * on their perk choice filter rules.
     */
    useEffect(() => {
        const perkRules = getItemChoiceRules(clazz?.system?.rules ?? []).filter(it => it.pack === "perk")
        const filteredChoices = perkRules.flatMap(it => it.choices).map(it => it.value)
        setClassRestrictedPerksList([
            { value: '', label: strings.emptySlot, img: '', prereqs: [], cardSubheader: [], description: '' },
            ...ItemsCache.perks().filter(it => filteredChoices.includes(it.uuid)).map(perk => toDisplayablePerk(perk))
        ])
    }, [clazz])

    useEffect(() => {
        getItemGrants('perk', [ancestry]).then(grants => {
            setAncestryPerkGrants(grants)  
        })

        setAncestryPerkSlots(loadInitialSlots(
            getItemChoiceRules(ancestry?.system?.rules ?? []).filter(it => it.pack === "perk")
        ))

        getItemGrants('perk', [clazz]).then(grants => {
            setClassPerkGrants(grants)
        })

        setClassPerkSlots(loadInitialSlots(
            getItemChoiceRules(clazz?.system?.rules ?? []).filter(it => it.pack === "perk")
        ))
    }, [ancestry, clazz])

    const loadInitialSlots = (rules) => {
        const slots: any[] = []
        rules.filter(r => r.pack === 'perk').forEach(rule => {
            Array.from({ length: rule.maxChoices }).forEach(_ => {
                slots.push({ value: '', label: strings.emptySlot, ruleName: rule.label, ruleId: rule.id })
            })
        })
        return slots
    }

    const onSelectPerk = useCallback((slotIndex: number, perk: string, perkId: string, setter: any) => {
        setter(prevSlots =>
            prevSlots.map((slot, index) =>
                index === slotIndex ? { ...slot, label: perk, value: perkId } : slot
            )
        )
    }, [])

    const grantedPerks = () => {
        return [...ancestryPerkGrants, ...classPerkGrants].map(g => {
            const perk = perksList.find(p => p.value === g.uuid)
            return { value: perk?.value, label: perk?.label }
        })
    }

    const PerkSelection = () => {
        return (<>
            <div className="bg-sheet-main-fill space-y-4">
                {/* HEADER AND NAVIGATION BUTTONS */}
                <Header title={strings.perksHeader} />
                <TopNavButtons navButtons={navButtons} />

                {/* USER HELPER */}
                <HeroCreationLabel text={strings.perkAquisition} />

                <HeroCreationSuccessMessage text={strings.allPerksSelected} />

                {/* GRANTED PERKS */}
                <div className="mt-4 space-y-1">
                    <HeroCreationLabel text={strings.grantedPerks} />
                    {
                        [...ancestryPerkGrants, ...classPerkGrants].map((grant, index) => (
                            <ItemGrantCard key={index} name={grant.item} source={grant.source} />
                        ))
                    }
                </div>

                {/* CHOOSE CLASS PERKS */}
                {classPerkSlots.length > 0 &&
                    <div className="mt-4 space-y-2">
                        <BonusChoiceTitle text={`${classPerkSlots[0].ruleName}`} />
                        <ItemSelectorGroup
                            slotGroup={classPerkSlots}
                            options={classRestrictedPerksList}
                            otherSlotGroup={ancestryPerkSlots}
                            grants={[...ancestryPerkGrants, ...classPerkGrants]}
                            onSelect={(index, label, selectedId) => onSelectPerk(index, label, selectedId, setClassPerkSlots)}
                        />
                    </div>
                }

                {/* CHOOSE ANCESTRY PERKS */}
                {ancestryPerkSlots.length > 0 &&
                    <BonusChoiceContainer>
                        <div className="flex gap-x-6">
                            <BonusChoiceTitle text={`${ancestry?.name} ${ancestryPerkSlots[0].ruleName}`} />
                            {/* CHECKBOX TOGGLE FOR PERK ELIGIBILITY FILTER */}
                            <Checkbox label={"Filter by eligibility"} onCheckedChanged={() => setUseEligibilityFilter(!useEligibilityFilter)} checked={useEligibilityFilter} />
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

            </div>

            <div className="mt-4 space-y-1">
                {/* CHOSEN PERKS */}
                <HeroCreationLabel text={strings.perksList} />
                {[...grantedPerks(), ...ancestryPerkSlots, ...classPerkSlots].filter(slot => (slot.value?.length ?? 0) > 0).map(slot => {
                    const perk = perksList.find(p => p.value === slot.value)
                    if (perk) {
                        return (
                            <SkillCard
                                key={perk.value}
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
        </>)
    }

    return { PerkSelection, ancestryPerkSlots, classPerkSlots, setAncestryPerkSlots, setClassPerkSlots }
}