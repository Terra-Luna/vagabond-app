import { ReactNode, useCallback, useEffect, useMemo, useState } from "react"

import { AncestryDataModel } from "../../../model/item/character/AncestryDataModel"
import { ClassDataModel } from "../../../model/item/character/ClassDataModel"
import { PerkDataModel } from "../../../model/item/character/PerkDataModel"
import { EquipmentDataModel, EquipmentSchema } from "../../../model/item/equip/EquipmentDataModel"
import { getItemChoiceRules, getItemGrants, getItemRules, getItemRuleSources, ItemRule } from "../../../rules/util/item-rules-util"
import { ItemsCache } from "../../../rules/util/ItemsCache"
import { appLang } from "../../../utils/lang"
import { ClearHeader, Header } from "../../../view/component/Header"
import { BonusChoiceContainer, BonusChoiceTitle } from "../../hero-creator/component/BonusChoiceContaner"
import { HeroCreationLabel } from "../../hero-creator/component/HeroCreationTypography"
import { ItemGrantCard } from "../../hero-creator/component/ItemGrantCard"
import { ItemSelectorGroup } from "../../hero-creator/component/ItemSelectorGroup"
import { TopNavButtons } from "../../hero-creator/component/TopNavButtons"
import { Grimoire } from "./Grimoire"

export const useSpellSelectionView = (
    level: number,
    ancestry: (Item & { system: AncestryDataModel }) | undefined,
    clazz: (Item & { system: ClassDataModel }) | undefined,
    perks: PerkDataModel[] | undefined,
    items: (Item & { system: EquipmentDataModel<EquipmentSchema> })[],
    navButtons: ReactNode[],
    selectionsLoaded: boolean = true
) => {
    const strings = appLang.HeroCreation
    const isCreationMode = navButtons?.length > 0

    // All spells for selection.
    const [spellsList, setSpellsList] = useState<{ value: string, label: string, img: string, dmgType: string, description: string }[]>([])

    // Spells automatically granted by chosen Ancestry & Class.
    const [ancestrySpellGrants, setAncestrySpellGrants] = useState<(ItemRule & { item: string, uuid: string, source: string })[]>([])
    const [classSpellGrants, setClassSpellGrants] = useState<(ItemRule & { item: string, uuid: string, source: string })[]>([])

    // Player's spell choices for each slot.
    const [ancestrySpellSlots, setAncestrySpellSlots] = useState<{ value: string, label: string, ruleName: string, ruleId: string, selectionId?: string, allowedValues?: string[] }[]>([])
    const [classSpellSlots, setClassSpellSlots] = useState<{ value: string, label: string, ruleName: string, ruleId: string, selectionId?: string, allowedValues?: string[] }[]>([])
    const [perkSpellSlots, setPerkSpellSlots] = useState<{ value: string, label: string, ruleName: string, ruleId: string, selectionId?: string, allowedValues?: string[] }[]>([])
    const [itemSpellSlots, setItemSpellSlots] = useState<{ value: string, label: string, ruleName: string, ruleId: string, selectionId?: string, allowedValues?: string[] }[]>([])

    useEffect(() => {
        setSpellsList([
            { value: '', label: strings.emptySlot, img: '', dmgType: '', description: '' },
            ...ItemsCache.spells().map(spell => ({
                value: spell.uuid,
                label: spell.name,
                img: spell.img ?? '',
                dmgType: spell.system.damageType ?? 'none',
                description: spell.system.description
            }))
        ])
    }, [])

    const loadInitialSlots = useCallback((rules: any[]) => {
        const slots: any[] = []
        rules.filter(r => r.pack === 'spell').forEach(rule => {
            // Restrict slot options to the rule's static choices, when any are defined.
            const allowedValues = Array.isArray(rule.choices) && rule.choices.length > 0
                ? rule.choices.map((c: any) => c.value)
                : undefined
            Array.from({ length: rule.maxChoices }).forEach(() => {
                slots.push({ value: '', label: strings.emptySlot, ruleName: rule.label, ruleId: rule.id, selectionId: foundry.utils.randomID(), allowedValues, sourceItemId: rule.sourceItemId })
            })
        })
        return slots
    }, [])

    const perksSignature = JSON.stringify(perks?.map(p => (p as any).id ?? p._sourceId) ?? [])

    /**
     * Initial spell slot allocation.
     */
    useEffect(() => {
        getItemGrants('spell', [ancestry]).then(grants => setAncestrySpellGrants(grants))
        getItemGrants('spell', [clazz]).then(grants => setClassSpellGrants(grants))

        const ancestryRules = getItemChoiceRules(level, ancestry?.system?.rules?.filter(r => (r as any).level <= 1) ?? [])
        setAncestrySpellSlots(loadInitialSlots(ancestryRules.filter(r => r.pack === 'spell')))

        const classRuleCandidates = getItemRules(clazz).filter((r: any) => r.level <= 1 && (!isCreationMode || !r.skipAtHeroCreation))
        const classRules = getItemChoiceRules(level, classRuleCandidates).sort((a: any, b: any) => Number(Boolean(a.skipAtHeroCreation)) - Number(Boolean(b.skipAtHeroCreation)))

        setClassSpellSlots(loadInitialSlots(classRules.filter(r => r.pack === 'spell')))

        const perkRules = getItemChoiceRules(level, perks?.flatMap(p => p.rules?.filter(r => (r as any).level <= 1)) ?? [])
        setPerkSpellSlots(loadInitialSlots(perkRules.filter(r => r.pack === 'spell')))

        const itemRules = getItemChoiceRules(level, items?.flatMap(i => getItemRuleSources(i).flatMap(source =>
            source.rules.filter((r: any) => r.level <= 1).map((r: any) => ({ ...r, sourceItemId: source.owner.id }))
        )) ?? [])
        setItemSpellSlots(loadInitialSlots(itemRules.filter(r => r.pack === 'spell')))
    }, [ancestry, clazz, perksSignature, loadInitialSlots])

    const onSelectSpell = useCallback((slotIndex: number, spell: string, spellId: string, setter: any) => {
        setter(prevSlots =>
            prevSlots.map((slot, index) =>
                index === slotIndex ? { ...slot, label: spell, value: spellId } : slot
            )
        )
    }, [])

    const isAllSelected = useMemo(() => {
        return ![...classSpellSlots, ...ancestrySpellSlots].some(slot => slot.value.length === 0)
    }, [classSpellSlots, ancestrySpellSlots])

    const SpellSelection = <div className="@container h-full min-h-0 flex flex-col overflow-hidden">
        <div className="sticky top-0 bg-sheet-main-fill text-center items-center">
            <Header title={strings.spellsHeader} />
            <div className="mb-4" />
            <TopNavButtons navButtons={navButtons} subtitle={strings.spellsSubheader} canProceed={isAllSelected} />
        </div>

        <div className="flex flex-col flex-1 overflow-y-auto w-full justify-start px-2">
            <div className="inline-flex flex-col items-stretch w-full @2xl:w-3/5 mx-auto">
                {selectionsLoaded && <>
                    {/* GRANTED SPELLS (BY CLASS & ANCESTRY) */}
                    {[...ancestrySpellGrants, ...classSpellGrants, ...ancestrySpellSlots].length > 0 &&
                        <div className="space-y-1 mb-4">
                            {[...ancestrySpellGrants, ...classSpellGrants].length > 0 &&
                                <HeroCreationLabel text={strings.grantedSpells} />
                            }
                            {[...ancestrySpellGrants, ...classSpellGrants].map((grant, index) => (
                                <ItemGrantCard
                                    key={`grant-${index}`}
                                    img={spellsList.find(sp => sp.value === grant.uuid)?.img}
                                    name={grant.item}
                                    source={grant.source}
                                />
                            ))}

                            {/* ANCESTRY SPELL GRANT SLOT */}
                            {!isCreationMode && ancestrySpellSlots.length > 0 &&
                                ancestrySpellSlots.map((slot, idx) => (
                                    <ItemGrantCard
                                        key={`ancestry-slot-view-${idx}`}
                                        img={spellsList.find(sp => sp.value === slot.value)?.img}
                                        name={slot.label}
                                        source={slot.ruleName}
                                    />
                                ))
                            }
                        </div>
                    }

                    {/* SELECTABLE CLASS SPELL SLOTS */}
                    {classSpellSlots.length > 0 &&
                        <div className="font-eskapade font-bold">
                            <ClearHeader title={strings.classSpells} />
                            <ItemSelectorGroup
                                slotGroup={classSpellSlots}
                                options={spellsList}
                                otherSlotGroup={[...ancestrySpellSlots, ...perkSpellSlots, ...itemSpellSlots]}
                                grants={[...ancestrySpellGrants, ...classSpellGrants]}
                                onSelect={(index, label, selectedId) => onSelectSpell(index, label, selectedId, setClassSpellSlots)}
                            />
                        </div>
                    }

                    {/* SELECTABLE ITEM SPELL SLOTS */}
                    {itemSpellSlots.length > 0 &&
                        <div className="font-eskapade font-bold mt-2">
                            <ItemSelectorGroup
                                slotGroup={itemSpellSlots}
                                options={spellsList}
                                otherSlotGroup={[...classSpellSlots, ...ancestrySpellSlots, ...perkSpellSlots]}
                                grants={[]}
                                onSelect={(index, label, selectedId) => onSelectSpell(index, label, selectedId, setItemSpellSlots)}
                            />
                        </div>
                    }

                    {/* SELECTABLE ANCESTRY SPELL SLOTS (HERO CREATION ONLY) */}
                    {(ancestrySpellSlots.length > 0 && (isCreationMode || ancestrySpellSlots.some(slot => slot.value.length === 0))) &&
                        <BonusChoiceContainer>
                            <BonusChoiceTitle text={`${strings.ancestrySpells} (${ancestry?.name ?? ''}: ${ancestrySpellSlots[0].ruleName})`} />
                            <ItemSelectorGroup
                                slotGroup={ancestrySpellSlots}
                                options={spellsList}
                                otherSlotGroup={[...classSpellSlots, ...perkSpellSlots, ...itemSpellSlots]}
                                grants={[...ancestrySpellGrants, ...classSpellGrants]}
                                onSelect={(index, label, selectedId) => onSelectSpell(index, label, selectedId, setAncestrySpellSlots)}
                            />
                        </BonusChoiceContainer>
                    }

                    {/* PERK SPELL SLOTS (MAGICAL SECRETS) */}
                    {perkSpellSlots.length > 0 &&
                        <BonusChoiceContainer>
                            <BonusChoiceTitle text={strings.magicalSecrets} />
                            <ItemSelectorGroup
                                slotGroup={perkSpellSlots}
                                options={spellsList}
                                otherSlotGroup={[...classSpellSlots, ...ancestrySpellSlots, ...itemSpellSlots]}
                                grants={[...ancestrySpellGrants, ...classSpellGrants]}
                                onSelect={(index, label, selectedId) => onSelectSpell(index, label, selectedId, setPerkSpellSlots)}
                            />
                        </BonusChoiceContainer>
                    }

                    {/* YOUR GRIMOIRE */}
                    <Grimoire
                        spellGrants={[...ancestrySpellGrants, ...classSpellGrants]}
                        spellSlots={[...ancestrySpellSlots, ...classSpellSlots, ...perkSpellSlots, ...itemSpellSlots]}
                        spellsList={spellsList}
                    />
                </>}
            </div>
        </div>
    </div>

    return {
        SpellSelection, loadInitialSlots, spellsList,
        classSpellSlots, perkSpellSlots, ancestrySpellSlots, itemSpellSlots, classSpellGrants, ancestrySpellGrants,
        setAncestrySpellSlots, setClassSpellSlots, setPerkSpellSlots, setItemSpellSlots
    }
}