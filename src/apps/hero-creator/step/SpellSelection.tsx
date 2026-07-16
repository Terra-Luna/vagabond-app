import { useCallback, useEffect, useState } from "react"
import { AncestryDataModel } from "../../../model/item/character/AncestryDataModel"
import { ClassDataModel } from "../../../model/item/character/ClassDataModel"
import { vgLiteLang } from "../../../utils/lang"
import { CustomDropDown } from "../../../view/component/Dropdown"
import { Divider, Header } from "../../../view/component/Header"
import { useNavButtons } from "../../../view/context/navigation/NavButtons"
import { HeroCreationLabel, HeroCreationSubtext } from "../component/HeroCreationTypography"
import { CombinedItems } from "../../../utils/modelUtil"
import { getItemChoiceRules, getItemGrants, ItemRule } from "../../../view/component/rules/util/item-rules-util"
import { ItemGrantCard } from "../component/ItemGrantCard"
import { SkillCard } from "../../../view/component/SkillCard"
import { SpellDataModel } from "../../../model/item/character/SpellDataModel"
import { BonusChoiceContainer, BonusChoiceTitle } from "../component/BonusChoiceContaner"

export const useSpellSelection = (ancestry: Item & { system: AncestryDataModel } | undefined, clazz: Item & { system: ClassDataModel } | undefined) => {
    const strings = vgLiteLang.HeroCreation
    const { NavButtons, setCanProceed } = useNavButtons()

    // All spells for selection.
    const [spellsList, setSpellsList] = useState<{ value: string, label: string, img: string, dmgType: string, description: string }[]>([])

    // Spells automatically granted by chosen Ancestry & Class.
    const [ancestrySpellGrants, setAncestrySpellGrants] = useState<(ItemRule & { item: string, uuid: string, source: string })[]>([])
    const [classSpellGrants, setClassSpellGrants] = useState<(ItemRule & { item: string, uuid: string, source: string })[]>([])

    // Player's chose spells for each slot.
    const [ancestrySpellSlots, setAncestrySpellSlots] = useState<{ value: string, label: string, ruleName: string }[]>([])
    const [classSpellSlots, setClassSpellSlots] = useState<{ value: string, label: string }[]>([])

    useEffect(() => {
        CombinedItems('spell').then(spells => {
            setSpellsList([
                { value: '', label: strings.emptySlot, img: '', dmgType: '', description: '' },
                ...spells
                    .map(spell => ({
                        value: spell.uuid,
                        label: spell.name,
                        img: spell.img ?? '',
                        dmgType: (spell.system as SpellDataModel)?.damageType ?? 'none',
                        description: (spell.system as SpellDataModel)?.description
                    }))
            ])
        })
    }, [ancestrySpellGrants, classSpellGrants])

    useEffect(() => {
        getItemGrants('spell', [ancestry]).then(grants => {
            setAncestrySpellGrants(grants)
            getItemChoiceRules(ancestry?.system?.rules ?? []).then(rules => {
                const maxChoices = rules.filter(r => r.type === 'spell').reduce((sum, r) => { return sum + r.maxChoices }, 0)
                setAncestrySpellSlots(
                    Array.from({ length: maxChoices }).map(() => (
                        { value: '', label: strings.emptySlot, ruleName: rules[0].label }
                    ))
                )
            })
        })

        getItemGrants('spell', [clazz]).then(grants => {
            setClassSpellGrants(grants)
            if (clazz?.system?.initialSpellSlots && clazz.system.initialSpellSlots > 0) {
                const slotsCount = Math.max(0, clazz.system.initialSpellSlots - grants.length)
                setClassSpellSlots(
                    Array.from({ length: slotsCount }).map(() => (
                        { value: '', label: strings.emptySlot }
                    ))
                )
            }
        })
    }, [ancestry, clazz])

    const onSelectSpell = useCallback((slotIndex: number, spell: string, spellId: string, setter: any) => {
        setter(prevSlots =>
            prevSlots.map((slot, index) =>
                index === slotIndex ? { ...slot, label: spell, value: spellId } : slot
            )
        )
    }, [])

    /**
     * Filter to make sure spells are removed from other spell slot selectors
     * as the player makes selections for each slot...
     * @param index 
     * @param source 
     * @returns 
     */
    const getOtherSelectedIds = (index: number, source: 'class' | 'ancestry') => {
        const otherClassSlots = source === 'class' ? classSpellSlots.filter((_, i) => i !== index) : classSpellSlots
        const otherAncestrySlots = source === 'ancestry' ? ancestrySpellSlots.filter((_, i) => i !== index) : ancestrySpellSlots
        return [
            ...otherClassSlots,
            ...otherAncestrySlots,
            ...classSpellGrants.map(g => ({ value: g.uuid, label: g.item })),
            ...ancestrySpellGrants.map(g => ({ value: g.uuid, label: g.item }))
        ].map(s => s.value).filter(Boolean)
    }

    const SpellSelectorGroup = ({ slotGroup, source }: { slotGroup: { value: string, label: string }[], source: 'class' | 'ancestry' }) => {
        return (
            <div className="flex flex-wrap gap-2 mt-2 w-full">
                {
                    slotGroup.map((slot, index) => (
                        <CustomDropDown
                            key={index}
                            value={slot.value}
                            options={spellsList.filter(sp => sp.value === slot.value || !getOtherSelectedIds(index, source).includes(sp.value))}
                            className={"w-7/16"}
                            onChange={(e) => {
                                const selectedId = e.target.value
                                const selectedSpell = spellsList.find(sp => sp.value === selectedId)
                                const label = selectedSpell ? selectedSpell.label : ''
                                source === 'class' ?
                                    onSelectSpell(index, label, selectedId, setClassSpellSlots) :
                                    onSelectSpell(index, label, selectedId, setAncestrySpellSlots)
                            }}
                        />
                    ))
                }
            </div>
        )
    }

    const SpellSelection = () => {
        return (<>

            {/* HEADER AND NAVIGATION BUTTONS */}
            <div className="bg-sheet-main-fill space-y-4 text-center items-center">
                <NavButtons header={<Header title={strings.spellsHeader} />} />
                <HeroCreationSubtext text={strings.spellsSubheader} />
                <Divider />
            </div>

            {/* GRANTED SPELLS */}
            <div className="mt-4 space-y-1">
                <HeroCreationLabel text={strings.grantedSpells} />
                {
                    [...ancestrySpellGrants, ...classSpellGrants].map((grant, index) => (
                        <ItemGrantCard key={index} name={grant.item} source={grant.source} />
                    ))
                }
            </div>

            {/* CHOOSE CLASS SPELLS */}
            <div className="mt-4 space-y-2">
                <HeroCreationLabel text={strings.electiveSpells} />
                <HeroCreationSubtext text={strings.classSpells} />
                <SpellSelectorGroup slotGroup={classSpellSlots} source={'class'} />
            </div>

            {/* CHOOSE ANCESTRY SPELLS */}
            {ancestrySpellSlots.length > 0 &&
                <BonusChoiceContainer>
                    <BonusChoiceTitle text={`${strings.ancestrySpells} (${ancestry?.name ?? ''}: ${ancestrySpellSlots[0].ruleName})`} />
                    <SpellSelectorGroup slotGroup={ancestrySpellSlots} source={'ancestry'} />
                </BonusChoiceContainer>
            }

            {/* YOUR GRIMOIRE */}
            <div className="space-y-1 mt-4">
                <HeroCreationLabel text={strings.grimoire} />

                {/* GRANTED SPELLS */}
                {[...ancestrySpellGrants, ...classSpellGrants].map(g => {
                    const sp = spellsList.find(sp => sp.value === g.uuid)
                    if (sp) {
                        return (
                            <SkillCard
                                key={g.uuid}
                                img={sp.img}
                                dmgType={sp.dmgType}
                                title={sp.label}
                                subtitles={[{ label: vgLiteLang.HeroSheet.Magic.labelDmgBase, value: vgLiteLang.DamageTypes[sp.dmgType] }]}
                                description={sp.description}
                            />
                        )
                    }
                    else {
                        return <></>
                    }
                })}

                {/* CHOSEN SPELLS */}
                {[...ancestrySpellSlots, ...classSpellSlots].filter(slot => slot.value.length > 0).map(slot => {
                    const sp = spellsList.find(sp => sp.value === slot.value)
                    if (sp) {
                        return (
                            <SkillCard
                                key={sp.value}
                                img={sp.img}
                                dmgType={sp.dmgType}
                                title={sp.label}
                                subtitles={[{ label: vgLiteLang.HeroSheet.Magic.labelDmgBase, value: vgLiteLang.DamageTypes[sp.dmgType] }]}
                                description={sp.description}
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

    return { SpellSelection, ancestrySpellSlots, classSpellSlots }
}