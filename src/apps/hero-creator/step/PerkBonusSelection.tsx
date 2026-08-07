import { ReactNode, useEffect, useMemo, useState } from "react"
import { PerkDataModel } from "../../../model/item/character/PerkDataModel"
import { Header, Divider } from "../../../view/component/Header"
import { TopNavButtons } from "../component/TopNavButtons"
import { vgLiteLang } from "../../../utils/lang"
import { BonusChoiceContainer, BonusChoiceTitle } from "../component/BonusChoiceContaner"
import { HeroCreationDropdown } from "../component/HeroCreationDropdown"
import { getItemChoiceRules, getSkillTrainingChoiceRules, getStatChoiceRules, ItemRule } from "../../../rules/util/item-rules-util"
import { HeroCreationLabel, HeroCreationSubtext } from "../component/HeroCreationTypography"
import { SkillCard } from "../../../view/component/SkillCard"
import { ItemsCache } from "../../../rules/util/ItemsCache"
import { createDropdownEntriesFromObj } from "../../../utils/localeUtils"

export const usePerkBonusSelection = (
    perks: (Item & { system: PerkDataModel })[] | undefined,
    stats: { stat: string, value: number }[],
    requiredTrainings: { skill: string, source: any }[],
    selectedTrainings: { skill: string, ruleId: string }[],
    spellSlots: { value: string, label: string, ruleName: string, ruleId: string }[],
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

    const spells = useMemo((): ItemRule[] => {
        const rules = getItemChoiceRules(perks?.flatMap(p => p.system.rules) ?? [])
        rules.forEach(r => {
            r.choices = [
                ...[{ value: '', label: strings.emptySlot }],
                ...r.choices.filter(c => !spellSlots.map(sp => sp.value).includes(c.value))
            ]
        })
        return rules
    }, [perks, spellSlots])

    const selectedSpell = useMemo(() => {
        return ItemsCache.spells().find(it => it.uuid === spell?.value)
    }, [spell])

    const showAdditionalTrainingOnStatAdvancement = useMemo(() => {
        return advancement?.value === 'stats.reason' && (((stats?.find(s => s.stat === 'reason')?.value ?? 1) % 2) === 0)
    }, [advancement, stats])

    /**
     * Clear the addt'l training if they select a different stat advancement.
     */
    useEffect(() => {
        setReasonTraining(undefined)
    }, [advancement])

    const PerkBonusSelection = (
        <div className="bg-sheet-main-fill space-y-4 text-center items-center">
            <Header title={strings.bonusChoicesHeader} />
            <TopNavButtons navButtons={navButtons} subtitle="" />
            <Divider />
            <BonusChoiceContainer>
                <div className="space-y-4">
                    {/* SELECT STAT BONUS "ADVANCEMENT" */}
                    {
                        advancements.map((rule, index) => {
                            return (
                                <div key={index} className="flex flex-col justify-center gap-y-2">
                                    <BonusChoiceTitle text={rule.label} />
                                    {/* SELECTED STATS W/ BONUSES APPLIED */}
                                    <HeroCreationSubtext text={
                                        stats.map(s => `${vgLiteLang.Stat[s.stat].abbr}: ${s.value}`).join(" | ")
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
                        spells.map((rule, index) => {
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
                </div>
            </BonusChoiceContainer>

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