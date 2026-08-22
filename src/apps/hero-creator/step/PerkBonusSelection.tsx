import { ReactNode, useEffect, useMemo, useState } from "react"

import { PerkDataModel } from "../../../model/item/character/PerkDataModel"
import { getItemChoiceRules, getSkillTrainingChoiceRules, getStatChoiceRules, ItemRule } from "../../../rules/util/item-rules-util"
import { ItemsCache } from "../../../rules/util/ItemsCache"
import { vgLiteLang } from "../../../utils/lang"
import { createDropdownEntriesFromObj } from "../../../utils/localeUtils"
import { Header } from "../../../view/component/Header"
import { SkillCard } from "../../../view/component/SkillCard"
import { BonusChoiceContainer, BonusChoiceTitle } from "../component/BonusChoiceContaner"
import { HeroCreationDropdown } from "../component/HeroCreationDropdown"
import { HeroCreationLabel, HeroCreationSubtext } from "../component/HeroCreationTypography"
import { TopNavButtons } from "../component/TopNavButtons"

export const usePerkBonusSelection = (
    perks: (Item & { system: PerkDataModel })[] | undefined,
    stats: { stat: string, value: number }[],
    requiredTrainings: { skill: string, source: any }[],
    selectedTrainings: { skill: string, ruleId: string }[],
    spellSlots: { value: string, label: string, ruleName: string, ruleId: string }[],
    classSpellGrants: (ItemRule & { item: string; uuid: string; source: string; })[],
    ancestrySpellGrants: (ItemRule & { item: string; uuid: string; source: string; })[],
    navButtons: ReactNode[]
) => {
    const strings = vgLiteLang.HeroCreation
    const [advancement, setAdvancement] = useState<{ value: string, ruleId: string }>()
    const [perkTraining, setPerkTraining] = useState<{ value: string, ruleId: string }>()
    const [reasonTraining, setReasonTraining] = useState<{ value: string, ruleId: string }>()
    const [spell, setSpell] = useState<{ value: string, ruleId: string }>()

    const resetPerkBonusSelections = () => {
        setAdvancement(undefined)
        setPerkTraining(undefined)
        setReasonTraining(undefined)
        setSpell(undefined)
    }

    const advancements = useMemo(() => {
        const maxStats = stats.filter(it => it.value >= 7).map(it => it.stat)
        const rules = getStatChoiceRules(perks ?? [])
        rules.forEach(r => {
            r.choices = [
                ...[{ value: '', label: strings.emptySlot }],
                ...r.choices.filter(c => !maxStats.includes(c.value.replace("stats.", "")))
            ]
        })
        return rules
    }, [perks, stats])

    const trainings = useMemo(() => {
        const rules = getSkillTrainingChoiceRules(perks ?? [])
        rules.forEach(r => {
            const requiredValues = requiredTrainings.map(t => t.skill)
            const selectedValues = selectedTrainings.map(t => t.skill)
            r.choices = [
                ...[{ value: '', label: strings.emptySlot }],
                ...r.choices.filter(c =>
                    !requiredValues.includes(c.value.replace("skills.", "").replace(".isTrained", "")) &&
                    !selectedValues.includes(c.value.replace("skills.", "").replace(".isTrained", "")))
            ]
        })
        return rules
    }, [perks, selectedTrainings])

    const spellItemRules = useMemo((): ItemRule[] => {
        const rules = getItemChoiceRules(1, perks?.flatMap(p => p.system.rules) ?? [])
        rules.forEach(r => {
            r.choices = [
                ...[{ value: '', label: strings.emptySlot }],
                ...r.choices.filter(c =>
                    !spellSlots.map(sp => sp.value).includes(c.value) &&
                    ![...classSpellGrants, ...ancestrySpellGrants].map(g => g.uuid).includes(c.value)
                )
            ]
        })
        return rules
    }, [perks, spellSlots])

    const selectedSpell = useMemo(() => {
        return ItemsCache.spells().find(it => it.uuid === spell?.value)
    }, [spell])

    const showAdditionalTrainingOnStatAdvancement = useMemo(() => {
        return navButtons?.length > 0 && advancement?.value === 'stats.reason' && (((stats?.find(s => s.stat === 'reason')?.value ?? 1) % 2) === 0)
    }, [advancement, stats])

    /**
     * Clear the addt'l training if they select a different stat advancement.
     */
    useEffect(() => {
        setReasonTraining(undefined)
    }, [advancement])

    const PerkBonusSelection = (
        <div className="@container bg-sheet-main-fill space-y-1 mb-4 text-center items-center">

            <Header title={strings.bonusChoicesHeader} />
            {navButtons.length > 0 &&
                <div className="mt-4">
                    <TopNavButtons
                        navButtons={navButtons}
                        subtitle="A Perk selection has granted another choice..."
                        canProceed={!!advancement || !!spell || !!perkTraining}
                    />
                </div>
            }

            <div className="flex flex-col w-full justify-center">
                <div className="inline-flex flex-col items-stretch space-y-1 @2xl:w-1/2 mx-auto">
                    <BonusChoiceContainer>
                        {
                            advancements.map((rule, index) => {
                                return (
                                    <div key={index} className="flex flex-col justify-center gap-y-2">
                                        <BonusChoiceTitle text={rule.label} />
                                        {/* SELECTED STATS W/ BONUSES APPLIED */}
                                        <HeroCreationSubtext text={
                                            stats.map(s => `${vgLiteLang.Stat[s.stat]?.abbr}: ${s.value}`).join(" | ")
                                        } />
                                        <div className="flex items-end justify-center">
                                            <HeroCreationDropdown
                                                value={advancement?.value ?? ''}
                                                options={rule.choices}
                                                onChange={(val) => {
                                                    setAdvancement({ value: val, ruleId: rule.id })
                                                }}
                                            />
                                            {showAdditionalTrainingOnStatAdvancement &&
                                                <div className="flex gap-x-1 items-end ml-8">
                                                    <HeroCreationLabel text={"Addt'l Training:"} />
                                                    <HeroCreationDropdown
                                                        value={reasonTraining?.value ?? ''}
                                                        options={createDropdownEntriesFromObj(vgLiteLang.Skills).filter(sk =>
                                                            !requiredTrainings.map(t => t.skill).includes(sk.value) &&
                                                            !selectedTrainings.map(t => t.skill).includes(sk.value)
                                                        )}
                                                        onChange={(val) => {
                                                            setReasonTraining({ value: val, ruleId: rule.id })
                                                        }}
                                                    />
                                                </div>}
                                        </div>
                                    </div>
                                )
                            })
                        }

                        {/* SELECT BONUS "NEW TRAINING" */}
                        {
                            trainings.map((rule, index) => {
                                return (
                                    <div key={index} className="flex flex-col gap-y-2">
                                        <BonusChoiceTitle text={rule.label} />
                                        <div className="flex justify-center">
                                            <HeroCreationDropdown
                                                value={perkTraining?.value ?? ''}
                                                options={rule.choices}
                                                onChange={(val) => {
                                                    setPerkTraining({ value: val, ruleId: rule.id })
                                                }}
                                            />
                                        </div>
                                    </div>
                                )
                            })
                        }

                        {/* SELECT BONUS "MAGICAL SECRET" */}
                        {
                            spellItemRules.map((rule, index) => {
                                return (
                                    <div key={index} className="flex flex-col gap-y-2">
                                        <BonusChoiceTitle text={strings.magicalSecrets} />
                                        <div className="flex justify-center">
                                            <HeroCreationDropdown
                                                value={spell?.value ?? ''}
                                                options={rule.choices}
                                                onChange={(val) => {
                                                    setSpell({ value: val, ruleId: rule.id })
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
    )

    return { PerkBonusSelection, advancement, perkTraining, reasonTraining, spell, resetPerkBonusSelections }
}