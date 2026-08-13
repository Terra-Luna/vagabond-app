import { ReactNode, useCallback, useEffect, useMemo, useState } from "react"
import { AncestryDataModel } from "../../../model/item/character/AncestryDataModel"
import { ClassDataModel } from "../../../model/item/character/ClassDataModel"
import { vgLiteLang } from "../../../utils/lang"
import { Header } from "../../../view/component/Header"
import { HeroCreationLabel, HeroCreationSubtext } from "../component/HeroCreationTypography"
import { calculateRecurringChoices, getItemChoiceRules, getItemGrants, ItemRule } from "../../../rules/util/item-rules-util"
import { ItemGrantCard } from "../component/ItemGrantCard"
import { BonusChoiceContainer, BonusChoiceTitle } from "../component/BonusChoiceContaner"
import { ItemSelectorGroup } from "../component/ItemSelectorGroup"
import { TopNavButtons } from "../component/TopNavButtons"
import { PerkDataModel } from "../../../model/item/character/PerkDataModel"
import { ItemsCache } from "../../../rules/util/ItemsCache"
import { Grimoire } from "../component/Grimoire"

export const useSpellSelection = (
    level: number,
    ancestry: Item & { system: AncestryDataModel } | undefined,
    clazz: Item & { system: ClassDataModel } | undefined,
    perks: PerkDataModel[] | undefined,
    navButtons: ReactNode[]
) => {
    const strings = vgLiteLang.HeroCreation
    const isCreationMode = navButtons?.length > 0

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
            Array.from({ length: rule.maxChoices }).forEach(_ => {
                slots.push({ value: '', label: strings.emptySlot, ruleName: rule.label, ruleId: rule.id })
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

        const classRules = getItemChoiceRules(level, clazz?.system?.rules?.filter(r => (r as any).level <= 1) ?? [])
        setClassSpellSlots(loadInitialSlots(classRules.filter(r => r.pack === 'spell')))

        const perkRules = getItemChoiceRules(level, perks?.flatMap(p => p.rules?.filter(r => (r as any).level <= 1)) ?? [])
        setPerkSpellSlots(loadInitialSlots(perkRules.filter(r => r.pack === 'spell')))
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

    const SpellSelection = <div className="@container p2">
        <div className="bg-sheet-main-fill space-y-4 text-center items-center">
            <Header title={strings.spellsHeader} />
            <TopNavButtons navButtons={navButtons} subtitle={strings.spellsSubheader} canProceed={isAllSelected} />
        </div>

        <div className="flex flex-col w-full justify-center">
            <div className="inline-flex flex-col items-stretch space-y-4 @2xl:w-1/2 mx-auto">
                <div className="mt-4 space-y-1">
                    {[...ancestrySpellGrants, ...classSpellGrants].length > 0 &&
                        <HeroCreationLabel text={strings.grantedSpells} />
                    }
                    {[...ancestrySpellGrants, ...classSpellGrants].map((grant, index) => (
                        <ItemGrantCard key={`grant-${index}`} name={grant.item} source={grant.source} />
                    ))}
                    {!isCreationMode && ancestrySpellSlots.length > 0 &&
                        ancestrySpellSlots.map((slot, idx) => (<ItemGrantCard key={`ancestry-slot-view-${idx}`} name={slot.label} source={slot.ruleName} />))
                    }
                </div>

                <div className="mt-4 space-y-2">
                    <HeroCreationSubtext text={strings.classSpells} />
                    <ItemSelectorGroup
                        slotGroup={classSpellSlots}
                        options={spellsList}
                        otherSlotGroup={[...ancestrySpellSlots, ...perkSpellSlots]}
                        grants={[...ancestrySpellGrants, ...classSpellGrants]}
                        onSelect={(index, label, selectedId) => onSelectSpell(index, label, selectedId, setClassSpellSlots)}
                    />
                </div>

                {(ancestrySpellSlots.length > 0 && isCreationMode) &&
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

                {/* PERK SPELL SLOTS (MAGICAL SECRETS) */}
                {(perkSpellSlots.length > 0 && isCreationMode) &&
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
                <Grimoire
                    spellGrants={[...ancestrySpellGrants, ...classSpellGrants]}
                    spellSlots={[...ancestrySpellSlots, ...classSpellSlots, ...perkSpellSlots]}
                    spellsList={spellsList}
                />
            </div>
        </div>
    </div>

    return {
        SpellSelection, loadInitialSlots, spellsList,
        classSpellSlots, perkSpellSlots, ancestrySpellSlots, classSpellGrants, ancestrySpellGrants,
        setAncestrySpellSlots, setClassSpellSlots, setPerkSpellSlots
    }
}