import { ReactNode, useCallback, useEffect, useMemo, useState } from "react"

import { AncestryDataModel } from "../../../model/item/character/AncestryDataModel"
import { ClassDataModel } from "../../../model/item/character/ClassDataModel"
import { ChoiceRule, createElectiveTrainingsRule, findElectiveTrainingsRule, getPerkSkillSubselections, getRequiredSkillTrainingRules, getSkillNameFromPath, getSkillTrainingChoiceRules, ItemRule, normalizeRuleSelections, randomId } from "../../../rules/util/item-rules-util"
import { appLang } from "../../../utils/lang"
import { Divider, Header } from "../../../view/component/Header"
import { BonusChoiceContainer, BonusChoiceTitle } from "../../hero-creator/component/BonusChoiceContaner"
import { BorderedContent } from "../../hero-creator/component/BorderedContent"
import { HeroCreationLabel, HeroCreationSubtext } from "../../hero-creator/component/HeroCreationTypography"
import { ItemGrantCard } from "../../hero-creator/component/ItemGrantCard"
import { TopNavButtons } from "../../hero-creator/component/TopNavButtons"
import { TrainingSelector } from "../../hero-creator/component/TrainingSelector"

export const useTrainingSelection = (
    ancestry: (Item & { system: AncestryDataModel }) | undefined,
    clazz: (Item & { system: ClassDataModel }) | undefined,
    stats: { stat: string, value: number }[],
    navButtons: ReactNode[]
) => {
    // Skills which are automatically assigned.
    const [requiredTrainingRules, setRequiredTrainingRules] = useState<{ source: Item, skill: string }[]>([])

    // Check if class (or ancestry) already has an Elective Trainings rule.
    const existingClassElectiveRule = useMemo(() => {
        return findElectiveTrainingsRule(clazz?.system?.rules)
    }, [clazz])

    // Generate a rule to save their Training selections. This gets injected into their class document while saving.
    const electiveTrainingsRuleId = useMemo<string>(() => {
        return existingClassElectiveRule?.id ? String(existingClassElectiveRule.id) : String(randomId())
    }, [existingClassElectiveRule])

    const electiveTrainingsRule = useMemo<ChoiceRule>(() => {
        return createElectiveTrainingsRule({
            id: electiveTrainingsRuleId,
            reasonValue: stats.find(s => s.stat === 'reason')?.value ?? 0
        })
    }, [stats, electiveTrainingsRuleId])
    const [electiveTrainingRules, setElectiveTrainingRules] = useState<ItemRule[]>([])
    const [chosenTrainings, setChosenTrainings] = useState<{ skill: string, ruleId: string }[]>([])

    // Ancestry skill choices.
    const [ancestryTrainingRules, setAncestryTrainingRules] = useState<ItemRule[]>([])

    // Bonus skills from Ancestry.
    const [chosenBonusSkills, setChosenBonusSkills] = useState<{ skill: string, ruleId: string }[]>([])

    // Skills chosen as perk subselections (e.g. New Training perk).
    const perkTrainingSkills = useMemo(() => {
        return getPerkSkillSubselections([ancestry, clazz])
    }, [ancestry, clazz, ancestry?.system?.rules, clazz?.system?.rules])

    /**
     * Sets player's training selection rules when ancestry, class, or stats are updated.
     */
    useEffect(() => {
        setRequiredTrainingRules(getRequiredSkillTrainingRules([ancestry, clazz]))
        setAncestryTrainingRules(getSkillTrainingChoiceRules([ancestry]))

        const addTrainingRules = (item: any) => {
            // Passing in a destructured Class item to force this function to give back what we need.
            setElectiveTrainingRules(getSkillTrainingChoiceRules([{
                ...item,
                system: {
                    ...item.system,
                    rules: [
                        electiveTrainingsRule //<-- fake rule, gets saved on Hero's Class Item later (or directly on the Hero if starting at level 0).
                    ]
                }
            } as any]))
        }

        if (clazz) {
            addTrainingRules(clazz)
        }
        else if (ancestry) {
            addTrainingRules(ancestry)
        }
    }, [ancestry, clazz, electiveTrainingsRule])

    // Load initial selections from existing item rules if present
    useEffect(() => {
        const ancestrySkillRules = getSkillTrainingChoiceRules([ancestry])
        const existingAncestrySelections = ancestrySkillRules.flatMap(rule => {
            const rawRule = ancestry?.system?.rules?.find((r: any) => r.id === rule.id)
            const selections = normalizeRuleSelections(rawRule?.selections || rule.selections)
            return selections.map(s => ({ skill: getSkillNameFromPath(s.value), ruleId: String(rule.id) }))
        })

        if (existingAncestrySelections.length > 0) {
            setChosenBonusSkills(existingAncestrySelections)
        }

        const existingClassRule = findElectiveTrainingsRule(clazz?.system?.rules, electiveTrainingsRuleId)
        if (existingClassRule) {
            const selections = normalizeRuleSelections(existingClassRule.selections)
            const existingClassSelections = selections.map(s => ({
                skill: getSkillNameFromPath(s.value),
                ruleId: String(existingClassRule.id)
            }))
            if (existingClassSelections.length > 0) {
                setChosenTrainings(existingClassSelections)
            }
        }
    }, [ancestry?.id, clazz?.id, electiveTrainingsRuleId])

    const ancestryTrainingMaxChoices = useMemo(() => {
        return ancestryTrainingRules.reduce((sum, item) => sum + (item.maxChoices || 0), 0)
    }, [ancestryTrainingRules])

    const onSelectLevel1Training = useCallback((skill: string, ruleId: string, isSelected: boolean) => {
        if (isSelected) {
            setChosenTrainings(prev => {
                if (prev.length < (electiveTrainingsRule?.maxChoices ?? 0)) {
                    return [...prev, { skill: skill, ruleId: ruleId }]
                }
                return prev
            })
        }
        else {
            setChosenTrainings(prev => prev.filter(sk => sk.skill !== skill))
        }
    }, [electiveTrainingsRule?.maxChoices])

    const onSelectBonusSkill = useCallback((skill: string, ruleId: string, isSelected: boolean) => {
        if (isSelected) {
            setChosenBonusSkills(prev => {
                const ruleMax = ancestryTrainingRules.find(r => r.id === ruleId)?.maxChoices ?? 1
                const currentForRule = prev.filter(sk => sk.ruleId === ruleId).length
                if (currentForRule < ruleMax && prev.length < ancestryTrainingMaxChoices) {
                    return [...prev, { skill: skill, ruleId: ruleId }]
                }
                return prev
            })
        }
        else {
            setChosenBonusSkills(prev => prev.filter(sk => sk.skill !== skill))
        }
    }, [ancestryTrainingRules, ancestryTrainingMaxChoices])

    const canProceed = useMemo(() => {
        const isL1SkillsSelected = chosenTrainings.length === electiveTrainingsRule.maxChoices
        const isBonusSkillsSelected = chosenBonusSkills.length === ancestryTrainingMaxChoices
        return isL1SkillsSelected && isBonusSkillsSelected
    }, [chosenTrainings.length, electiveTrainingsRule.maxChoices, chosenBonusSkills.length, ancestryTrainingMaxChoices])

    const TrainingSelection = (
        <div className="@container bg-sheet-main-fill flex flex-col h-full min-h-0 overflow-hidden">
            {/* HEADER AND NAVIGATION BUTTONS */}
            <div className="flex-shrink-0 space-y-4">
                <Header title={appLang.HeroCreation.traingingsHeader} />
                <TopNavButtons navButtons={navButtons} subtitle={appLang.HeroCreation.trainingSubheader} canProceed={canProceed} />
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
                <div className="items-center justify-center text-center w-full space-y-2 mt-2">
                    {/* SELECTED STATS W/ BONUSES APPLIED */}
                    <HeroCreationSubtext text={stats.map(s => `${appLang.Stat[s.stat].abbr}: ${s.value}`).join(" | ")} />
                    <Divider />
                </div>

                <div className="flex flex-col w-full justify-center">
                    <div className="inline-flex flex-col items-stretch space-y-4 @2xl:w-1/2 mx-auto">
                        {/* GRANTED TRAININGS LIST */}
                        <div className="space-y-1">
                            <HeroCreationLabel text={appLang.HeroCreation.grantedTraining} />
                            {
                                requiredTrainingRules.map((rule, index) => (
                                    <ItemGrantCard key={index}
                                        name={appLang.Skills[rule.skill].name}
                                        subtext={`(${appLang.Skills[rule.skill].stat})`}
                                        source={rule.source.name}
                                    />
                                ))
                            }
                        </div>

                        {/* TRAINING CHOICE COUNTER */}
                        <div className="justify-center text-center bg-context-menu-fill/25">
                            <BorderedContent className="flex-col gap-y-2 justify-center w-full">
                                <HeroCreationSubtext text={appLang.HeroCreation.trainingSlots} />
                                <p className="text-4xl text-text-header-tertiary font-eskapade font-bold">
                                    {`${chosenTrainings.length} / ${electiveTrainingsRule!.maxChoices} ${appLang.HeroCreation.selected}`}
                                </p>
                            </BorderedContent>
                        </div>

                        {/* LEVEL 1 TRAINING SELECTIONS */}
                        <div className="space-y-1 mt-2">
                            <HeroCreationLabel text={appLang.HeroCreation.electiveTraining.replace("%s", `${electiveTrainingsRule!.maxChoices}`)} />
                            {electiveTrainingRules.flatMap(rule => ({ id: rule.id, choices: rule.choices })).map(rule => {
                                return rule.choices.filter(choice => {
                                    const skill = getSkillNameFromPath(choice.value)
                                    if (chosenTrainings.some(sk => sk.skill === skill)) {
                                        return true
                                    }
                                    if (chosenTrainings.length === electiveTrainingsRule.maxChoices) {
                                        return false
                                    }
                                    return !chosenBonusSkills.some(sk => sk.skill === skill) &&
                                        !requiredTrainingRules.some(r => r.skill === skill) &&
                                        !perkTrainingSkills.includes(skill)
                                }).map(choice => {
                                    const skill = getSkillNameFromPath(choice.value)
                                    const isSelected = chosenTrainings.some(sk => sk.skill === skill)
                                    return (
                                        <TrainingSelector
                                            key={rule.id + choice.value}
                                            skill={skill}
                                            label={choice.label}
                                            isSelected={isSelected}
                                            onSelect={() => onSelectLevel1Training(skill, rule.id, !isSelected)}
                                        />
                                    )
                                })
                            })}
                        </div>

                        {/* BONUS TRAINING SELECTIONS */}
                        {ancestryTrainingRules.length > 0 &&
                            <BonusChoiceContainer>
                                {ancestryTrainingRules.map((rule, index) => {
                                    const ruleChosenSkills = chosenBonusSkills.filter(sk => sk.ruleId === rule.id)
                                    const isRuleMaxed = ruleChosenSkills.length >= (rule.maxChoices || 1)
                                    return (
                                        <div key={index} className="space-y-1">
                                            <BonusChoiceTitle text={`${appLang.HeroCreation.bonusTraining.replace("%s1", `${ancestry?.name} ${rule.label}`).replace("%s2", (rule.maxChoices || 1).toString())}`} />
                                            {rule.choices.filter(choice => {
                                                const skillName = getSkillNameFromPath(choice.value)
                                                if (ruleChosenSkills.some(sk => sk.skill === skillName)) {
                                                    return true
                                                }
                                                if (isRuleMaxed) {
                                                    return false
                                                }
                                                return !chosenTrainings.some(sk => sk.skill === skillName) &&
                                                    !requiredTrainingRules.some(r => r.skill === skillName) &&
                                                    !chosenBonusSkills.some(sk => sk.ruleId !== rule.id && sk.skill === skillName) &&
                                                    !perkTrainingSkills.includes(skillName)
                                            }).map(choice => {
                                                const skill = getSkillNameFromPath(choice.value)
                                                const isSelected = ruleChosenSkills.some(sk => sk.skill === skill)
                                                return (
                                                    <TrainingSelector
                                                        key={rule.id + choice.value}
                                                        skill={skill}
                                                        label={choice.label}
                                                        isSelected={isSelected}
                                                        onSelect={() => onSelectBonusSkill(skill, rule.id, !isSelected)}
                                                    />
                                                )
                                            })}
                                        </div>
                                    )
                                })}
                            </BonusChoiceContainer>
                        }
                    </div>
                </div>
            </div>
        </div>
    )

    return {
        TrainingSelection, requiredTrainingRules, chosenTrainings, chosenBonusSkills,
        setRequiredTrainingRules, setChosenTrainings, setChosenBonusSkills, electiveTrainingRules,
        electiveTrainingsRuleId, perkTrainingSkills
    }
}