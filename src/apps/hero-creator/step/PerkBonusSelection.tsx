import { ReactNode, useCallback, useMemo, useState } from "react"
import { PerkDataModel } from "../../../model/item/character/PerkDataModel"
import { Header, Divider } from "../../../view/component/Header"
import { TopNavButtons } from "../component/TopNavButtons"
import { vgLiteLang } from "../../../utils/lang"
import { BonusChoiceContainer, BonusChoiceTitle } from "../component/BonusChoiceContaner"
import { HeroCreationDropdown } from "../component/HeroCreationDropdown"
import { getItemChoiceRules, getSkillTrainingChoiceRules, getStatChoiceRules, ItemRule, savePerkSelectionFlags } from "../../../rules/util/item-rules-util"
import { HeroDataModel } from "../../../model/actor/HeroDataModel"
import { HeroCreationSubtext } from "../component/HeroCreationTypography"
import { SkillCard } from "../../../view/component/SkillCard"
import { ItemsCache } from "../../../rules/util/ItemsCache"

export const usePerkBonusSelection = (
    actor: Actor & { system: HeroDataModel },
    perks: (Item & { system: PerkDataModel })[] | undefined,
    stats: { stat: string, value: number }[],
    requiredTrainings: { skill: string, source: any }[],
    selectedTrainings: { skill: string, ruleId: string }[],
    spellSlots: { value: string, label: string, ruleName: string, ruleId: string }[],
    navButtons: ReactNode[]
) => {
    const strings = vgLiteLang.HeroCreation
    const [advancement, setAdvancement] = useState<string>('')
    const [training, setTraining] = useState<string>('')
    const [spell, setSpell] = useState<string>('')

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

    const onChoiceSelection = useCallback((selection, rule) => {
        savePerkSelectionFlags(actor, [{ ruleId: rule.id, value: selection }])
    }, [actor])

    const selectedSpell = useMemo(() => {
        return ItemsCache.spells().find(it => it.uuid === spell)
    }, [spell])

    const PerkBonusSelection = () => {
        return (
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
                                    <div key={index} className="space-y-2">
                                        <BonusChoiceTitle text={rule.label} />
                                        {/* SELECTED STATS W/ BONUSES APPLIED */}
                                        <HeroCreationSubtext text={
                                            stats.map(s => `${vgLiteLang.Stat[s.stat].abbr}: ${s.value}`).join(" | ")
                                        } />
                                        <HeroCreationDropdown
                                            value={advancement}
                                            options={rule.choices}
                                            onChange={(val) => {
                                                setAdvancement(val)
                                                onChoiceSelection(val, rule)
                                            }}
                                        />
                                    </div>
                                )
                            })
                        }

                        {/* SELECT BONUS "NEW TRAINING" */}
                        {
                            trainings.map((rule, index) => {
                                return (
                                    <div key={index} className="space-y-2">
                                        <BonusChoiceTitle text={rule.label} />
                                        <HeroCreationDropdown
                                            value={training}
                                            options={rule.choices}
                                            onChange={(val) => {
                                                setTraining(val)
                                                onChoiceSelection(`${val}`, rule)
                                            }}
                                        />
                                    </div>
                                )
                            })
                        }
                        
                        {/* SELECT BONUS "MAGICAL SECRET" */}
                        {
                            spells.map((rule, index) => {
                                return (
                                    <div key={index} className="space-y-2">
                                        <BonusChoiceTitle text={strings.magicalSecrets} />
                                        <HeroCreationDropdown
                                            value={spell}
                                            options={rule.choices}
                                            onChange={(val) => {
                                                setSpell(val)
                                                onChoiceSelection(val, rule)
                                            }}
                                        />
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
    }

    return { PerkBonusSelection }
}