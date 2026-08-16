import { useState, useEffect, useCallback, ReactNode, useMemo } from "react"
import { AncestryDataModel } from "../../../model/item/character/AncestryDataModel"
import { ClassDataModel } from "../../../model/item/character/ClassDataModel"
import { vgLiteLang } from "../../../utils/lang"
import { Divider, Header } from "../../../view/component/Header"
import { HeroCreationLabel, HeroCreationSubtext } from "../component/HeroCreationTypography"
import { getRequiredSkillTrainingRules, getSkillNameFromPath, getSkillTrainingChoiceRules, ItemRule } from "../../../rules/util/item-rules-util"
import { BorderedContent } from "../component/BorderedContent"
import { TrainingSelector } from "../component/TrainingSelector"
import { ItemGrantCard } from "../component/ItemGrantCard"
import { BonusChoiceContainer, BonusChoiceTitle } from "../component/BonusChoiceContaner"
import { TopNavButtons } from "../component/TopNavButtons"
import { ChoiceRule } from "../../../rules/ItemRulesManager"

export const useTrainingSelection = (
    ancestry: (Item & { system: AncestryDataModel }) | undefined,
    clazz: (Item & { system: ClassDataModel }) | undefined,
    stats: { stat: string, value: number }[],
    navButtons: ReactNode[]
) => {
    const strings = vgLiteLang.HeroCreation

    // Skills which are automatically assigned.
    const [requiredTrainingRules, setRequiredTrainingRules] = useState<{ source: Item, skill: string }[]>([])
    // Generate a rule to save their Level 1 Training selections. This gets injected into their class document while saving.
    const level1RuleId = useMemo(() => foundry.utils.randomID(), [])
    const level1TrainingRule = useMemo<ChoiceRule>(() => {
        return {
            id: level1RuleId,
            key: "ChoiceSet",
            label: "Level 1 Trainings",
            level: 1,
            scale: 0,
            channel: "path",
            sourceMode: "static",
            maxChoices: Math.ceil((stats.find(s => s.stat === 'reason')?.value ?? 0) / 2),
            choices: [{ value: "skills.*.isTrained", label: "Skills" }],
            selections: []
        }
    }, [ancestry, clazz, stats, level1RuleId])
    const [level1TrainingRules, setLevel1TrainingRules] = useState<ItemRule[]>([])
    const [chosenLevel1Skills, setChosenLevel1Skills] = useState<{ skill: string, ruleId: string }[]>([])

    // Ancestry skill choices.
    const [ancestryTrainingRules, setAncestryTrainingRules] = useState<ItemRule[]>([])
    const [ancestryTrainingMaxChoices, setAncestryTrainingMaxChoices] = useState<number>(0)

    // Bonus skills from Ancestry.
    const [chosenBonusSkills, setChosenBonusSkills] = useState<{ skill: string, ruleId: string }[]>([])

    /**
     * Sets player's training selection rules when ancestry, class, or stats are updated.
     */
    useEffect(() => {
        setChosenBonusSkills([])
        setRequiredTrainingRules(getRequiredSkillTrainingRules([ancestry, clazz]))
        setAncestryTrainingRules(getSkillTrainingChoiceRules([ancestry]))
        if (clazz) {
            // Passing in a destructured Class item to force this function to give back what we need.
            setLevel1TrainingRules(getSkillTrainingChoiceRules([{
                ...clazz,
                system: {
                    ...clazz.system,
                    rules: [
                        ...clazz.system.rules,
                        level1TrainingRule //<-- fake rule, gets saved on Hero's Class Item later.
                    ]
                }
            } as unknown as Item & { system: ClassDataModel }]))
        }
    }, [ancestry, clazz, stats])


    useEffect(() => {
        const ancestryTrainingMaxChoices = ancestryTrainingRules.reduce((sum, item) => { return sum + (item.maxChoices || 0) }, 0)
        setAncestryTrainingMaxChoices(ancestryTrainingMaxChoices)
    }, [ancestryTrainingRules])

    const onSelectLevel1Training = useCallback((skill: string, ruleId: string, isSelected: boolean) => {
        if (isSelected && chosenLevel1Skills.length < (level1TrainingRule?.maxChoices ?? 0)) {
            setChosenLevel1Skills([...chosenLevel1Skills, { skill: skill, ruleId: ruleId }])
        }
        else {
            setChosenLevel1Skills(chosenLevel1Skills.filter(sk => sk.skill !== skill))
        }
    }, [chosenLevel1Skills, level1TrainingRule?.maxChoices])

    const onSelectBonusSkill = useCallback((skill: string, ruleId: string, isSelected: boolean) => {
        if (isSelected && chosenBonusSkills.length < ancestryTrainingMaxChoices) {
            setChosenBonusSkills([...chosenBonusSkills, { skill: skill, ruleId: ruleId }])
        }
        else {
            setChosenBonusSkills(chosenBonusSkills.filter(sk => sk.skill !== skill))
        }
    }, [chosenBonusSkills, ancestryTrainingMaxChoices])

    const canProceed = useMemo(() => {
        const isL1SkillsSelected = chosenLevel1Skills.length === level1TrainingRule.maxChoices
        const isBonusSkillsSelected = chosenBonusSkills.length === ancestryTrainingMaxChoices
        return isL1SkillsSelected && isBonusSkillsSelected
    }, [chosenLevel1Skills, level1TrainingRule, chosenBonusSkills, ancestryTrainingMaxChoices])

    const TrainingSelection = (
        <div className="@container bg-sheet-main-fill space-y-4">
            {/* HEADER AND NAVIGATION BUTTONS */}
            <Header title={strings.traingingsHeader} />
            <TopNavButtons navButtons={navButtons} subtitle={strings.trainingSubheader} canProceed={canProceed} />

            <div className="items-center justify-center text-center w-full space-y-2">

                {/* SELECTED STATS W/ BONUSES APPLIED */}
                <HeroCreationSubtext text={
                    stats.map(s => `${vgLiteLang.Stat[s.stat].abbr}: ${s.value}`).join(" | ")
                } />

                <Divider />
            </div>

            <div className="flex flex-col w-full justify-center">
                <div className="inline-flex flex-col items-stretch space-y-4 @2xl:w-1/2 mx-auto">
                    {/* GRANTED TRAININGS LIST */}
                    <div className="space-y-1">
                        <HeroCreationLabel text={strings.grantedTraining} />
                        {
                            requiredTrainingRules.map((rule, index) => (
                                <ItemGrantCard key={index}
                                    name={vgLiteLang.Skills[rule.skill].name}
                                    subtext={`(${vgLiteLang.Skills[rule.skill].stat})`}
                                    source={rule.source.name}
                                />
                            ))
                        }
                    </div>

                    {/* TRAINING CHOICE COUNTER */}
                    <div className="justify-center text-center bg-context-menu-fill/25">
                        <BorderedContent className="flex-col gap-y-2 justify-center w-full">
                            <HeroCreationSubtext text={strings.trainingSlots} />
                            <p className="text-4xl text-text-header-tertiary font-bold">{`${chosenLevel1Skills.length} / ${level1TrainingRule!.maxChoices} ${strings.selected}`}</p>
                        </BorderedContent>
                    </div>

                    {/* LEVEL 1 TRAINING SELECTIONS */}
                    <div className="space-y-1 mt-2">
                        <HeroCreationLabel text={strings.electiveTraining.replace("%s", `${level1TrainingRule!.maxChoices}`)} />
                        {level1TrainingRules.flatMap(rule => ({ id: rule.id, choices: rule.choices })).map(rule => {
                            return rule.choices.filter(choice => {
                                if (chosenLevel1Skills.length === level1TrainingRule.maxChoices) {
                                    return chosenLevel1Skills.map(sk => sk.skill).includes(getSkillNameFromPath(choice.value))
                                }
                                else {
                                    return !chosenBonusSkills.map(sk => sk.skill).includes(getSkillNameFromPath(choice.value)) &&
                                        !requiredTrainingRules.map(r => r.skill).includes(getSkillNameFromPath(choice.value))
                                }
                            }).map(choice => {
                                const skill = getSkillNameFromPath(choice.value)
                                const isSelected = chosenLevel1Skills.map(sk => sk.skill).includes(skill)
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
                            {ancestryTrainingRules.map((rule, index) => (
                                <div key={index} className="space-y-1">
                                    <BonusChoiceTitle text={`${strings.bonusTraining.replace("%s1", `${ancestry?.name} ${rule.label}`).replace("%s2", rule.maxChoices.toString())}`} />
                                    {
                                        rule.maxChoices > chosenBonusSkills.length ?
                                            rule.choices.map(c => ({ value: c.value, label: c.label })).filter(c =>
                                                !chosenLevel1Skills.map(sk => sk.skill).includes(getSkillNameFromPath(c.value)) &&
                                                !requiredTrainingRules.map(r => r.skill).includes(getSkillNameFromPath(c.value))
                                            ).map(choice => {
                                                const skill = getSkillNameFromPath(choice.value)
                                                const isSelected = chosenBonusSkills.map(sk => sk.skill).includes(skill)
                                                return (
                                                    <TrainingSelector
                                                        key={skill}
                                                        skill={skill}
                                                        label={choice.label}
                                                        isSelected={isSelected}
                                                        onSelect={() => onSelectBonusSkill(skill, rule.id, !isSelected)}
                                                    />
                                                )
                                            }) : chosenBonusSkills.map(sk => (
                                                <TrainingSelector
                                                    key={sk.skill}
                                                    skill={sk.skill}
                                                    label={vgLiteLang.Skills[sk.skill].name}
                                                    isSelected={true}
                                                    onSelect={() => onSelectBonusSkill(sk.skill, rule.id, false)}
                                                />
                                            ))
                                    }
                                </div>
                            ))}
                        </BonusChoiceContainer>
                    }
                </div>
            </div>
        </div>
    )

    return {
        TrainingSelection, requiredTrainingRules, chosenLevel1Skills, chosenBonusSkills,
        setRequiredTrainingRules, setChosenLevel1Skills, setChosenBonusSkills, level1TrainingRules
    }
}