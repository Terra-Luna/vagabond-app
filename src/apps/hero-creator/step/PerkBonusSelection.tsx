import { ReactNode, useEffect, useMemo, useRef, useState } from "react"

import { PerkDataModel } from "../../../model/item/character/PerkDataModel"
import { getItemChoiceRules, getRuleSelectionValues, getSkillTrainingChoiceRules, getSpellChoices, getStatChoiceRules, ItemRule } from "../../../rules/util/item-rules-util"
import { ItemsCache } from "../../../rules/util/ItemsCache"
import { vgLiteLang } from "../../../utils/lang"
import { createDropdownEntriesFromObj } from "../../../utils/localeUtils"
import { Header } from "../../../view/component/Header"
import { SkillCard } from "../../../view/component/SkillCard"
import { BonusChoiceContainer, BonusChoiceTitle } from "../component/BonusChoiceContaner"
import { HeroCreationDropdown } from "../component/HeroCreationDropdown"
import { HeroCreationLabel, HeroCreationSubtext } from "../component/HeroCreationTypography"
import { TopNavButtons } from "../component/TopNavButtons"

const expandChoiceRules = (rules: any[]) => rules.flatMap((rule, ruleIndex) =>
    Array.from({ length: Math.max(Number(rule.maxChoices) || 1, 1) }, (_, index) => ({
        ...rule,
        selectionKey: `${rule.id}:${rule.sourceKey ?? ruleIndex}:${index}`,
        selectionIndex: index
    }))
)

const getRuleSelections = (rule: any, predicate: (value: string) => boolean) =>
    getRuleSelectionValues(rule.selections).filter(predicate)

const getInitialRuleSelections = (rule: any, initialSelections: Record<string, string[]>) =>
    initialSelections[`${rule.sourceKey}:${rule.id}`] ?? initialSelections[rule.id] ?? rule.selections

export const usePerkBonusSelection = (
    perks: (Item & { system: PerkDataModel })[] | undefined,
    stats: { stat: string, value: number }[],
    requiredTrainings: { skill: string, source: any }[],
    selectedTrainings: { skill: string, ruleId: string }[],
    spellSlots: { value: string, label: string, ruleName: string, ruleId: string }[],
    classSpellGrants: (ItemRule & { item: string; uuid: string; source: string; })[],
    ancestrySpellGrants: (ItemRule & { item: string; uuid: string; source: string; })[],
    navButtons: ReactNode[],
    initialSelections: Record<string, string[]> = {},
    isHeroCreation: boolean = false
) => {
    const strings = vgLiteLang.HeroCreation
    const [advancementSelections, setAdvancementSelections] = useState<Record<string, string>>({})
    const [perkTrainingSelections, setPerkTrainingSelections] = useState<Record<string, string>>({})
    const [reasonTrainingSelections, setReasonTrainingSelections] = useState<Record<string, string>>({})
    const [spellSelections, setSpellSelections] = useState<Record<string, string>>({})
    const hydratedBonusSignature = useRef("")
    const [hydratedBonusSignatureState, setHydratedBonusSignatureState] = useState("")

    const bonusRulesSignature = useMemo(() => JSON.stringify((perks ?? []).map(perk => ({
        sourceId: (perk as any).id ?? (perk as any)._sourceId,
        rules: perk.system.rules
            .filter(rule => rule.key === "ChoiceSet")
            .map(rule => ({ id: rule.id, maxChoices: rule.maxChoices, pack: rule.pack }))
    }))), [perks])
    const currentBonusSignature = `${bonusRulesSignature}:${JSON.stringify(initialSelections)}`

    const resetPerkBonusSelections = () => {
        setAdvancementSelections({})
        setPerkTrainingSelections({})
        setReasonTrainingSelections({})
        setSpellSelections({})
    }

    const advancements = useMemo(() => {
        const rules = expandChoiceRules((perks ?? []).flatMap((perk, perkIndex) => getStatChoiceRules([{ system: { rules: perk.system.rules.map(rule => ({ ...rule, sourceKey: (perk as any).sourceKey ?? perkIndex })) } } as any])))

        const savedValueByRule: Record<string, string> = {}
        const selectedValueByRule: Record<string, string> = {}
        rules.forEach(r => {
            const savedValue = isHeroCreation ? '' : (getRuleSelections({ ...r, selections: getInitialRuleSelections(r, initialSelections) }, value => value.startsWith('stats.'))[r.selectionIndex] ?? '')
            savedValueByRule[r.selectionKey] = savedValue
            selectedValueByRule[r.selectionKey] = advancementSelections[r.selectionKey] || savedValue
        })

        rules.forEach(r => {
            const selectedValue = selectedValueByRule[r.selectionKey] ?? ''
            r.choices = [
                ...[{ value: '', label: strings.emptySlot }],
                ...r.choices.filter(c => {
                    if (c.value === selectedValue) return true
                    const stat = c.value.replace("stats.", "")
                    const baseValue = Number(stats.find(it => it.stat === stat)?.value ?? 0)
                    // `stats` already reflects every saved pick outside hero creation; only count OTHER rules' picks
                    // that differ from what was already saved, since those aren't reflected in `baseValue` yet.
                    const otherPendingAdjustment = Object.keys(selectedValueByRule).reduce((sum, key) => {
                        if (key === r.selectionKey) return sum
                        const current = selectedValueByRule[key]
                        const saved = savedValueByRule[key]
                        if (current === saved) return sum
                        return sum + (current === c.value ? 1 : 0) - (saved === c.value ? 1 : 0)
                    }, 0)
                    return (baseValue + otherPendingAdjustment) < 7
                })
            ]
        })
        return rules
    }, [advancementSelections, initialSelections, isHeroCreation, perks, stats])

    // Advancement rules that bumped Reason from an even to an odd value, unlocking another skill training.
    const reasonTrainingRules = useMemo(() => {
        const reasonValue = stats.find(s => s.stat === 'reason')?.value ?? 1
        return advancements.filter(rule => advancementSelections[rule.selectionKey] === 'stats.reason' && reasonValue % 2 === 0)
    }, [advancements, advancementSelections, stats])

    const trainings = useMemo(() => {
        const rules = expandChoiceRules((perks ?? []).flatMap((perk, perkIndex) => getSkillTrainingChoiceRules([{ system: { rules: perk.system.rules.map(rule => ({ ...rule, sourceKey: (perk as any).sourceKey ?? perkIndex })) } } as any])))
        rules.forEach(r => {
            const requiredValues = requiredTrainings.map(t => t.skill)
            const selectedValues = selectedTrainings.map(t => t.skill)
            const currentValue = getRuleSelections({ ...r, selections: getInitialRuleSelections(r, initialSelections) }, value => value.startsWith('skills.'))[r.selectionIndex] ?? ''
            r.choices = [
                ...[{ value: '', label: strings.emptySlot }],
                ...r.choices.filter(c =>
                    !requiredValues.includes(c.value.replace("skills.", "").replace(".trained", "")) &&
                    (!selectedValues.includes(c.value.replace("skills.", "").replace(".trained", "")) || c.value === currentValue))
            ]
        })
        return rules
    }, [initialSelections, perks, requiredTrainings, selectedTrainings])

    const spellItemRules = useMemo((): (ItemRule & { sourceKey: string | number, selectionKey: string, selectionIndex: number })[] => {
        const rules = expandChoiceRules(
            (perks ?? []).flatMap((perk, perkIndex) => {
                const itemRules = getItemChoiceRules(1, perk.system.rules.map(rule => ({
                    ...rule,
                    sourceKey: (perk as any).sourceKey ?? perkIndex
                })))
                return itemRules
                    .filter(rule => rule.pack === "spell")
                    .map(rule => ({ ...rule, choices: rule.choices.length > 0 ? rule.choices : getSpellChoices() }))
            })
        )
        rules.forEach(r => {
            const currentValue = getRuleSelections({ ...r, selections: getInitialRuleSelections(r, initialSelections) }, value => !value.startsWith('stats.') && !value.startsWith('skills.'))[r.selectionIndex] ?? ''
            r.choices = [
                ...[{ value: '', label: strings.emptySlot }],
                ...r.choices.filter(c =>
                    !spellSlots.map(sp => sp.value).includes(c.value) &&
                    ![...classSpellGrants, ...ancestrySpellGrants].map(g => g.uuid).includes(c.value) || c.value === currentValue
                )
            ]
        })
        return rules
    }, [ancestrySpellGrants, classSpellGrants, initialSelections, perks, spellSlots])

    // Tracks which perk currently occupies each slot, so a removed-then-reused slot doesn't inherit a stale sub-selection.
    const perkIdBySourceKey = useMemo(() => {
        const map: Record<string, string> = {}
            ; (perks ?? []).forEach((perk, perkIndex) => {
                const sourceKey = String((perk as any).sourceKey ?? perkIndex)
                map[sourceKey] = (perk as any).uuid ?? (perk as any).id ?? (perk as any)._sourceId ?? ''
            })
        return map
    }, [perks])
    const previousPerkIdBySourceKey = useRef<Record<string, string>>({})

    useEffect(() => {
        const previous = previousPerkIdBySourceKey.current
        const changedSourceKeys = new Set<string>()
        new Set([...Object.keys(previous), ...Object.keys(perkIdBySourceKey)]).forEach(sourceKey => {
            if (previous[sourceKey] !== perkIdBySourceKey[sourceKey]) changedSourceKeys.add(sourceKey)
        })
        previousPerkIdBySourceKey.current = perkIdBySourceKey
        if (changedSourceKeys.size === 0) return

        const purgeStaleSelections = (setter: React.Dispatch<React.SetStateAction<Record<string, string>>>) => {
            setter(previous => {
                const next = { ...previous }
                let changed = false
                Object.keys(next).forEach(selectionKey => {
                    if (changedSourceKeys.has(selectionKey.split(':')[1])) {
                        delete next[selectionKey]
                        changed = true
                    }
                })
                return changed ? next : previous
            })
        }
        purgeStaleSelections(setAdvancementSelections)
        purgeStaleSelections(setPerkTrainingSelections)
        purgeStaleSelections(setReasonTrainingSelections)
        purgeStaleSelections(setSpellSelections)
    }, [perkIdBySourceKey])

    useEffect(() => {
        if (hydratedBonusSignature.current === currentBonusSignature) return
        hydratedBonusSignature.current = currentBonusSignature

        const getSelections = (rules: any[], predicate: (value: string) => boolean, transform = (value: string) => value) => Object.fromEntries(rules.map(rule => [
            rule.selectionKey,
            transform(getRuleSelections({ ...rule, selections: getInitialRuleSelections(rule, initialSelections) }, predicate)[rule.selectionIndex] ?? '')
        ]))
        const updateSelections = (setter: React.Dispatch<React.SetStateAction<Record<string, string>>>, next: Record<string, string>) => {
            setter(previous => {
                // Keep any in-memory selections for rules that still exist; only seed new rules from initialSelections.
                const merged = { ...next }
                Object.keys(previous).forEach(key => {
                    if (key in merged) merged[key] = previous[key]
                })
                return JSON.stringify(previous) === JSON.stringify(merged) ? previous : merged
            })
        }
        updateSelections(setAdvancementSelections, getSelections(advancements, value => value.startsWith('stats.')))
        updateSelections(setPerkTrainingSelections, getSelections(trainings, value => value.startsWith('skills.')))
        updateSelections(setReasonTrainingSelections, getSelections(advancements, value => value.startsWith('skills.'), value => value.replace('skills.', '').replace('.trained', '')))
        updateSelections(setSpellSelections, getSelections(spellItemRules, value => !value.startsWith('stats.') && !value.startsWith('skills.')))
        setHydratedBonusSignatureState(currentBonusSignature)
    }, [advancements, currentBonusSignature, initialSelections, spellItemRules, trainings])

    const selectedSpell = useMemo(() => {
        const selectedSpellId = Object.values(spellSelections).find(Boolean)
        return ItemsCache.spells().find(it => it.uuid === selectedSpellId)
    }, [spellSelections])

    const selectedAdvancements = useMemo(() => Object.entries(advancementSelections)
        .filter(([, value]) => value)
        .map(([selectionKey, value]) => ({ ruleId: selectionKey.split(':')[0], selectionId: selectionKey.split(':')[1], value })), [advancementSelections])
    const selectedPerkTrainings = useMemo(() => Object.entries(perkTrainingSelections)
        .filter(([, value]) => value)
        .map(([selectionKey, value]) => ({ ruleId: selectionKey.split(':')[0], selectionId: selectionKey.split(':')[1], value })), [perkTrainingSelections])
    const selectedReasonTrainings = useMemo(() => Object.entries(reasonTrainingSelections)
        .filter(([, value]) => value)
        .map(([selectionKey, value]) => ({ ruleId: selectionKey.split(':')[0], selectionId: selectionKey.split(':')[1], value })), [reasonTrainingSelections])
    const selectedSpells = useMemo(() => Object.entries(spellSelections)
        .filter(([, value]) => value)
        .map(([selectionKey, value]) => ({ ruleId: selectionKey.split(':')[0], selectionId: selectionKey.split(':')[1], value })), [spellSelections])

    const allBonusSelections = useMemo(() => [
        ...Object.entries(advancementSelections).map(([selectionKey, value]) => ({ ruleId: selectionKey.split(':')[0], selectionId: selectionKey.split(':')[1], value })),
        ...Object.entries(perkTrainingSelections).map(([selectionKey, value]) => ({ ruleId: selectionKey.split(':')[0], selectionId: selectionKey.split(':')[1], value })),
        ...Object.entries(reasonTrainingSelections).map(([selectionKey, value]) => ({ ruleId: selectionKey.split(':')[0], selectionId: selectionKey.split(':')[1], value: value ? `skills.${value}.trained` : '' })),
        ...Object.entries(spellSelections).map(([selectionKey, value]) => ({ ruleId: selectionKey.split(':')[0], selectionId: selectionKey.split(':')[1], value }))
    ], [advancementSelections, perkTrainingSelections, reasonTrainingSelections, spellSelections])

    const bonusChoicesByPerk = useMemo(() => Object.fromEntries((perks ?? []).map((perk, perkIndex) => {
        const sourceKey = (perk as any).sourceKey ?? perkIndex
        const perkAdvancements = advancements.filter(rule => rule.sourceKey === sourceKey)
        const perkTrainings = trainings.filter(rule => rule.sourceKey === sourceKey)
        const perkSpells = spellItemRules.filter(rule => rule.sourceKey === sourceKey)
        return [sourceKey, (
            <div className="flex flex-col mt-1" key={sourceKey}>
                {[...perkAdvancements, ...perkTrainings, ...perkSpells].map(rule => (
                    <HeroCreationDropdown
                        key={rule.selectionKey}
                        value={advancementSelections[rule.selectionKey] ?? perkTrainingSelections[rule.selectionKey] ?? spellSelections[rule.selectionKey] ?? ''}
                        options={rule.choices}
                        onChange={(value) => {
                            if (perkAdvancements.includes(rule)) {
                                setAdvancementSelections(previous => ({ ...previous, [rule.selectionKey]: value }))
                                if (value !== 'stats.reason') {
                                    setReasonTrainingSelections(previous => {
                                        const next = { ...previous }
                                        delete next[rule.selectionKey]
                                        return next
                                    })
                                }
                            }
                            else if (perkTrainings.includes(rule)) setPerkTrainingSelections(previous => ({ ...previous, [rule.selectionKey]: value }))
                            else setSpellSelections(previous => ({ ...previous, [rule.selectionKey]: value }))
                        }}
                    />
                ))}
            </div>
        )]
    })), [advancementSelections, advancements, perkTrainingSelections, perks, spellItemRules, spellSelections, strings.magicalSecrets, trainings])

    const PerkBonusSelection = (
        <div className="@container bg-sheet-main-fill flex flex-col h-full min-h-0 overflow-hidden mb-4 text-center items-center">

            <div className="flex-shrink-0 w-full space-y-1">
                <Header title={strings.bonusChoicesHeader} />
                {navButtons.length > 0 &&
                    <div className="mt-4">
                        <TopNavButtons
                            navButtons={navButtons}
                            subtitle="A Perk selection has granted another choice..."
                            canProceed={selectedAdvancements.length > 0 || selectedSpells.length > 0 || selectedPerkTrainings.length > 0}
                        />
                    </div>
                }
            </div>

            <div className="flex-1 overflow-y-auto w-full space-y-1">
            <div className="flex flex-col w-full justify-center">
                <div className="inline-flex flex-col items-stretch space-y-1 @2xl:w-1/2 mx-auto">
                    <BonusChoiceContainer>
                        {advancements.length > 0 &&
                            <div className="flex flex-col justify-center">
                                <BonusChoiceTitle text={advancements[0].label} />
                                <HeroCreationSubtext text={
                                    stats
                                        .filter(stat => stat.stat !== "baseStatBlock")
                                        .map(stat => `${vgLiteLang.Stat[stat.stat]?.abbr}: ${stat.value}`)
                                        .join(" | ")
                                } />
                                <div className="flex flex-wrap gap-2">
                                    {advancements.map((rule) => (
                                        <div key={rule.selectionKey} className="flex items-end">
                                            <HeroCreationDropdown
                                                value={advancementSelections[rule.selectionKey] ?? ''}
                                                options={rule.choices}
                                                onChange={(val) => {
                                                    setAdvancementSelections(prev => ({ ...prev, [rule.selectionKey]: val }))
                                                    if (val !== 'stats.reason') {
                                                        setReasonTrainingSelections(prev => {
                                                            const next = { ...prev }
                                                            delete next[rule.selectionKey]
                                                            return next
                                                        })
                                                    }
                                                }}
                                            />
                                            {navButtons.length > 0 && advancementSelections[rule.selectionKey] === 'stats.reason' &&
                                                (((stats?.find(s => s.stat === 'reason')?.value ?? 1) % 2) === 0) &&
                                                <div className="flex gap-x-1 items-end ml-8">
                                                    <HeroCreationLabel text={"Addt'l Training:"} />
                                                    <HeroCreationDropdown
                                                        value={reasonTrainingSelections[rule.selectionKey] ?? ''}
                                                        options={createDropdownEntriesFromObj(vgLiteLang.Skills).filter(sk =>
                                                            !requiredTrainings.map(t => t.skill).includes(sk.value) &&
                                                            !selectedTrainings.map(t => t.skill).includes(sk.value)
                                                        )}
                                                        onChange={(val) => {
                                                            setReasonTrainingSelections(prev => ({ ...prev, [rule.selectionKey]: val }))
                                                        }}
                                                    />
                                                </div>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        }

                        {/* SELECT BONUS "NEW TRAINING" */}
                        {
                            trainings.map((rule) => {
                                return (
                                    <div key={rule.selectionKey} className="flex flex-col">
                                        <BonusChoiceTitle text={rule.label} />
                                        <div className="flex justify-center">
                                            <HeroCreationDropdown
                                                value={perkTrainingSelections[rule.selectionKey] ?? ''}
                                                options={rule.choices}
                                                onChange={(val) => {
                                                    setPerkTrainingSelections(prev => ({ ...prev, [rule.selectionKey]: val }))
                                                }}
                                            />
                                        </div>
                                    </div>
                                )
                            })
                        }

                        {/* SELECT BONUS "MAGICAL SECRET" */}
                        {
                            spellItemRules.map((rule) => {
                                return (
                                    <div key={rule.selectionKey} className="flex flex-col">
                                        <BonusChoiceTitle text={strings.magicalSecrets} />
                                        <div className="flex justify-center">
                                            <HeroCreationDropdown
                                                value={spellSelections[rule.selectionKey] ?? ''}
                                                options={rule.choices}
                                                onChange={(val) => {
                                                    setSpellSelections(prev => ({ ...prev, [rule.selectionKey]: val }))
                                                }}
                                            />
                                        </div>
                                    </div>
                                )
                            })
                        }

                    </BonusChoiceContainer>
                </div>
            </div>

            {selectedSpell &&
                <div className="text-left">
                    <SkillCard
                        img={selectedSpell.img ?? ''}
                        title={selectedSpell.name}
                        subtitles={[{ label: vgLiteLang.HeroSheet.Magic.labelDmgBase, value: vgLiteLang.DamageTypes[selectedSpell.system.damageType] }]}
                        dmgType={selectedSpell.system.damageType}
                        description={selectedSpell.system.description}
                        startCollapsed={false}
                    />
                </div>
            }
            </div>
        </div>
    )

    return {
        PerkBonusSelection,
        advancement: selectedAdvancements[0],
        perkTraining: selectedPerkTrainings[0],
        reasonTraining: selectedReasonTrainings[0],
        spell: selectedSpells[0],
        advancements: selectedAdvancements,
        perkTrainings: selectedPerkTrainings,
        reasonTrainings: selectedReasonTrainings,
        spells: selectedSpells,
        allBonusSelections,
        bonusChoicesByPerk,
        reasonTrainingRules,
        reasonTrainingSelections,
        setReasonTrainingSelections,
        isBonusSelectionHydrated: hydratedBonusSignatureState === currentBonusSignature,
        resetPerkBonusSelections
    }
}