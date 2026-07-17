import { useCallback, useEffect, useState } from "react"
import { AncestryDataModel } from "../../../model/item/character/AncestryDataModel"
import { ClassDataModel } from "../../../model/item/character/ClassDataModel"
import { vgLiteLang } from "../../../utils/lang"
import { Header } from "../../../view/component/Header"
import { useNavButtons } from "../../../view/context/navigation/NavButtons"
import { HeroCreationLabel, HeroCreationSuccessMessage } from "../component/HeroCreationTypography"
import { getItemChoiceRules, getItemGrants, ItemRule } from "../../../view/component/rules/util/item-rules-util"
import { PerkDataModel, perkPrerequisites } from "../../../model/item/character/PerkDataModel"
import { CombinedItems } from "../../../utils/modelUtil"
import { CardSubHeaderValues, SkillCard } from "../../../view/component/SkillCard"
import { ItemGrantCard } from "../component/ItemGrantCard"
import { BonusChoiceContainer, BonusChoiceTitle } from "../component/BonusChoiceContaner"
import { ItemSelectorGroup } from "../component/ItemSelectorGroup"

export const usePerkSelection = (ancestry: Item & { system: AncestryDataModel } | undefined, clazz: Item & { system: ClassDataModel } | undefined) => {
    const strings = vgLiteLang.HeroCreation
    const { NavButtons, setCanProceed } = useNavButtons()

    // All perks for selection.
    const [perksList, setPerksList] = useState<{ value: string, label: string, img: string, prereqs: any[], cardSubheader: CardSubHeaderValues[], description: string }[]>([])

    // Perks automatically granted by chosen Ancestry & Class.
    const [ancestryPerkGrants, setAncestryPerkGrants] = useState<(ItemRule & { item: string, uuid: string, source: string })[]>([])
    const [classPerkGrants, setClassPerkGrants] = useState<(ItemRule & { item: string, uuid: string, source: string })[]>([])

    // Player's chose perks for each slot.
    const [ancestryPerkSlots, setAncestryPerkSlots] = useState<{ value: string, label: string, ruleName: string }[]>([])
    const [classPerkSlots, setClassPerkSlots] = useState<{ value: string, label: string }[]>([])

    useEffect(() => {
        CombinedItems('perk').then(perks => {
            setPerksList([
                { value: '', label: strings.emptySlot, img: '', prereqs: [], cardSubheader: [], description: '' },
                ...perks
                    .map(perk => ({
                        value: perk.uuid,
                        label: perk.name,
                        img: perk.img ?? '',
                        prereqs: (perk.system as PerkDataModel)?.prerequisites,
                        cardSubheader: perkPrerequisites(perk.system as PerkDataModel),
                        description: (perk.system as PerkDataModel)?.description
                    }))
            ])
        })
    }, [])

    useEffect(() => {
        getItemGrants('perk', [ancestry]).then(grants => {
            setAncestryPerkGrants(grants)
            getItemChoiceRules(ancestry?.system?.rules ?? []).then(rules => {
                const maxChoices = rules.filter(r => r.pack === 'perk').reduce((sum, r) => { return sum + r.maxChoices }, 0)
                setAncestryPerkSlots(
                    Array.from({ length: maxChoices }).map(() => (
                        { value: '', label: strings.emptySlot, ruleName: rules[0].label }
                    ))
                )
            })
        })

        getItemGrants('perk', [clazz]).then(grants => {
            setClassPerkGrants(grants)
            getItemChoiceRules(clazz?.system?.rules ?? []).then(rules => {
                const maxChoices = rules.filter(r => r.pack === 'perk').reduce((sum, r) => { return sum + r.maxChoices }, 0)
                setClassPerkSlots(
                    Array.from({ length: maxChoices }).map(() => (
                        { value: '', label: strings.emptySlot, ruleName: rules[0].label }
                    ))
                )
            })
        })
    }, [ancestry, clazz])

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
                <NavButtons header={<Header title={strings.perksHeader} />} />

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
                        <BonusChoiceTitle text={clazz?.name ?? ''} />
                        <ItemSelectorGroup
                            slotGroup={classPerkSlots}
                            options={perksList}
                            otherSlotGroup={ancestryPerkSlots}
                            grants={[...ancestryPerkGrants, ...classPerkGrants]}
                            onSelect={(index, label, selectedId) => onSelectPerk(index, label, selectedId, setClassPerkSlots)}
                        />
                    </div>
                }

                {/* CHOOSE ANCESTRY PERKS */}
                {ancestryPerkSlots.length > 0 &&
                    <BonusChoiceContainer>
                        <BonusChoiceTitle text={`${ancestryPerkSlots[0].ruleName}`} />
                        <ItemSelectorGroup
                            slotGroup={ancestryPerkSlots}
                            options={perksList}
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

    return { PerkSelection }
}