import { ReactNode, useCallback, useEffect, useState } from "react"
import { AncestryDataModel } from "../../../model/item/character/AncestryDataModel"
import { ClassDataModel } from "../../../model/item/character/ClassDataModel"
import { vgLiteLang } from "../../../utils/lang"
import { Divider, Header } from "../../../view/component/Header"
import { HeroCreationLabel, HeroCreationSubtext } from "../component/HeroCreationTypography"
import { CombinedItems, getFullItem } from "../../../utils/modelUtil"
import { getItemChoiceRules, getItemGrants, ItemRule } from "../../../view/component/rules/util/item-rules-util"
import { ItemGrantCard } from "../component/ItemGrantCard"
import { SkillCard } from "../../../view/component/SkillCard"
import { SpellDataModel } from "../../../model/item/character/SpellDataModel"
import { BonusChoiceContainer, BonusChoiceTitle } from "../component/BonusChoiceContaner"
import { ItemSelectorGroup } from "../component/ItemSelectorGroup"
import { TopNavButtons } from "../component/TopNavButtons"
import { PerkDataModel } from "../../../model/item/character/PerkDataModel"

export const useSpellSelection = (
    ancestry: Item & { system: AncestryDataModel } | undefined,
    clazz: Item & { system: ClassDataModel } | undefined,
    perks: PerkDataModel[] | undefined,
    navButtons: ReactNode[]
) => {
    const isCreationMode = navButtons.length > 0
    const strings = vgLiteLang.HeroCreation

    // All spells for selection.
    const [spellsList, setSpellsList] = useState<{ value: string, label: string, img: string, dmgType: string, description: string }[]>([])

    // Spells automatically granted by chosen Ancestry & Class.
    const [ancestrySpellGrants, setAncestrySpellGrants] = useState<(ItemRule & { item: string, uuid: string, source: string })[]>([])
    const [classSpellGrants, setClassSpellGrants] = useState<(ItemRule & { item: string, uuid: string, source: string })[]>([])

    // Player's spell choices for each slot.
    const [ancestrySpellSlots, setAncestrySpellSlots] = useState<{ value: string, label: string, ruleName: string, ruleId: string }[]>([])
    const [classSpellSlots, setClassSpellSlots] = useState<{ value: string, label: string, ruleName: string, ruleId: string }[]>([])
    const [perkSpellSlots, setPerkSpellSlots] = useState<{ value: string, label: string, ruleName: string, ruleId: string }[]>([])

    useEffect(() => {
        CombinedItems('spell').then(spells => {
            const populateSpellsList = async () => {
                const fullSpells = await Promise.all(spells.map(sp => getFullItem<Item & { system: SpellDataModel }>(sp)))
                setSpellsList([
                    { value: '', label: strings.emptySlot, img: '', dmgType: '', description: '' },
                    ...fullSpells.filter(sp => sp != null).sort((a, b) => a.name.localeCompare(b.name))
                        .map(spell => ({
                            value: spell.uuid,
                            label: spell.name,
                            img: spell.img ?? '',
                            dmgType: (spell.system as any).damageType ?? 'none',
                            description: (spell.system as any).description
                        }))
                ])
            }
            populateSpellsList()
        })
    }, [])

    const loadInitialSlots = (rules) => {
        const slots: any[] = []
        rules.filter(r => r.pack === 'spell').forEach(rule => {
            Array.from({ length: rule.maxChoices }).forEach(_ => {
                slots.push({ value: '', label: strings.emptySlot, ruleName: rule.label, ruleId: rule.id })
            })
        })
        return slots
    }

    useEffect(() => {
        getItemGrants('spell', [ancestry]).then(grants => {
            setAncestrySpellGrants(grants)
        })
        getItemGrants('spell', [clazz]).then(grants => {
            setClassSpellGrants(grants)
        })
        getItemChoiceRules(ancestry?.system?.rules ?? []).then(rules => {
            setAncestrySpellSlots(loadInitialSlots(rules))
        })
        getItemChoiceRules(clazz?.system?.rules ?? []).then(rules => {
            setClassSpellSlots(loadInitialSlots(rules))
        })
        getItemChoiceRules(perks?.flatMap(p => p.rules) ?? []).then(rules => {
            setPerkSpellSlots(loadInitialSlots(rules))
        })
    }, [ancestry, clazz, perks])

    const onSelectSpell = useCallback((slotIndex: number, spell: string, spellId: string, setter: any) => {
        setter(prevSlots =>
            prevSlots.map((slot, index) =>
                index === slotIndex ? { ...slot, label: spell, value: spellId } : slot
            )
        )
    }, [])

    const SpellSelection = () => {
        return (<>

            {/* HEADER */}
            <div className="bg-sheet-main-fill space-y-4 text-center items-center">
                <Header title={strings.spellsHeader} />
                <TopNavButtons navButtons={navButtons} />
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
                {
                    !isCreationMode && ancestrySpellSlots.map(slot => (<ItemGrantCard key={slot.ruleId} name={slot.label} source={slot.ruleName} />))
                }
            </div>

            {/* CHOOSE CLASS SPELLS */}
            <div className="mt-4 space-y-2">
                <HeroCreationLabel text={strings.electiveSpells} />
                <HeroCreationSubtext text={strings.classSpells} />
                <ItemSelectorGroup
                    slotGroup={classSpellSlots}
                    options={spellsList}
                    otherSlotGroup={[...ancestrySpellSlots, ...perkSpellSlots]}
                    grants={[...ancestrySpellGrants, ...classSpellGrants]}
                    onSelect={(index, label, selectedId) => onSelectSpell(index, label, selectedId, setClassSpellSlots)}
                />
            </div>

            {/* CHOOSE ANCESTRY SPELLS */}
            {ancestrySpellSlots.length > 0 && isCreationMode &&
                <BonusChoiceContainer>
                    <BonusChoiceTitle text={`${strings.ancestrySpells} (${ancestry?.name ?? ''}: ${ancestrySpellSlots[0].ruleName})`} />
                    <ItemSelectorGroup
                        slotGroup={ancestrySpellSlots}
                        options={spellsList}
                        otherSlotGroup={[...classSpellSlots, ...perkSpellSlots]}
                        grants={[...ancestrySpellGrants, ...classSpellGrants]}
                        onSelect={(index, label, selectedId) => onSelectSpell(index, label, selectedId, setAncestrySpellSlots)}
                    />
                </BonusChoiceContainer>
            }

            {/* CHOOSE MAGICAL SECRET SPELLS */}
            {perkSpellSlots.length > 0 &&
                <BonusChoiceContainer>
                    <BonusChoiceTitle text={strings.magicalSecrets} />
                    <ItemSelectorGroup
                        slotGroup={perkSpellSlots}
                        options={spellsList}
                        otherSlotGroup={[...classSpellSlots, ...ancestrySpellSlots]}
                        grants={[...ancestrySpellGrants, ...classSpellGrants]}
                        onSelect={(index, label, selectedId) => onSelectSpell(index, label, selectedId, setPerkSpellSlots)}
                    />
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
                        return null
                    }
                })}

                {/* CHOSEN SPELLS */}
                {[...ancestrySpellSlots, ...classSpellSlots, ...perkSpellSlots].filter(slot => slot.value.length > 0).map(slot => {
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
                        return null
                    }
                })}
            </div>
        </>)
    }

    return { SpellSelection, ancestrySpellSlots, classSpellSlots, perkSpellSlots, setAncestrySpellSlots, setClassSpellSlots, setPerkSpellSlots, loadInitialSlots, spellsList }
}