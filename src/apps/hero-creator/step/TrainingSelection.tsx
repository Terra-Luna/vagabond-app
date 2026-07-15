import { useState, useRef, useEffect, useCallback } from "react"
import { AncestryDataModel } from "../../../model/item/character/AncestryDataModel"
import { ClassDataModel } from "../../../model/item/character/ClassDataModel"
import { vgLiteLang } from "../../../utils/lang"
import { Divider, Header } from "../../../view/component/Header"
import { useNavButtons } from "../../../view/context/navigation/NavButtons"
import { HeroCreationLabel, HeroCreationSubtext } from "../component/HeroCreationTypography"
import { getRequiredSkillTrainingRules, getSKillNameFromPath, getSkillTrainingChoiceRules, ItemRule } from "../../../view/component/rules/util/item-rules-util"
import { BorderedContent } from "../component/BorderedContent"
import { TrainingSelector } from "../component/TrainingSelector"
import { ItemGrantCard } from "../component/ItemGrantCard"
import { BonusChoiceContainer, BonusChoiceTitle } from "../component/BonusChoiceContaner"

export const useTrainingSelection = (
    ancestry: Item & { system: AncestryDataModel } | undefined,
    clazz: Item & { system: ClassDataModel } | undefined
) => {
    const strings = vgLiteLang.HeroCreation
    const { NavButtons, setCanProceed } = useNavButtons()
    const canProceedRef = useRef<boolean>(false)

    // Skills which are automatically assigned.
    const [requiredTrainingRules, setRequiredTrainingRules] = useState<{ source: Item, skill: string }[]>([])
    // The skills their chosen class allows for.
    const [classTrainingRules, setClassTrainingRules] = useState<ItemRule[]>([])
    const [classTrainingMaxChoices, setClassTrainingMaxChoices] = useState<number>(0)
    // Ancestry skill choices.
    const [ancestryTrainingRules, setAncestryTrainingRules] = useState<ItemRule[]>([])
    const [ancestryTrainingMaxChoices, setAncestryTrainingMaxChoices] = useState(0)

    const [chosenClassSKills, setChosenClassSkills] = useState<string[]>([])
    const [chosenBonusSkills, setChosenBonusSkills] = useState<string[]>([])

    useEffect(() => {
        setRequiredTrainingRules(getRequiredSkillTrainingRules([ancestry, clazz]))
        setAncestryTrainingRules(getSkillTrainingChoiceRules([ancestry]))
        setClassTrainingRules(getSkillTrainingChoiceRules([clazz]))
    }, [ancestry, clazz])

    useEffect(() => {
        const classTrainingMaxChoices = classTrainingRules.reduce((sum, item) => { return sum + (item.maxChoices || 0) }, 0)
        const ancestryTrainingMaxChoices = ancestryTrainingRules.reduce((sum, item) => { return sum + (item.maxChoices || 0) }, 0)
        setClassTrainingMaxChoices(classTrainingMaxChoices)
        setAncestryTrainingMaxChoices(ancestryTrainingMaxChoices)
    }, [classTrainingRules, ancestryTrainingRules])

    /**
     * Monitors the selected trainings to allow the player to proceed to the next step.
     */
    useEffect(() => {
        if (!classTrainingRules.length && !ancestryTrainingRules.length) {
            setCanProceed(false)
            return
        }
        const isAllClassSKillsChosen = chosenClassSKills.length === classTrainingMaxChoices
        const isBonusSkillChosen = ancestryTrainingMaxChoices === chosenBonusSkills.length
        setCanProceed(isAllClassSKillsChosen && isBonusSkillChosen);
    }, [chosenClassSKills, chosenBonusSkills, classTrainingMaxChoices, ancestryTrainingMaxChoices, classTrainingRules, ancestryTrainingRules])

    const onSelectClassSkill = useCallback((skill: string, isSelected: boolean) => {
        if (isSelected && chosenClassSKills.length < classTrainingMaxChoices) {
            setChosenClassSkills([...chosenClassSKills, skill])
        }
        else {
            setChosenClassSkills(chosenClassSKills.filter(sk => sk !== skill))
        }
    }, [chosenClassSKills, classTrainingMaxChoices])

    const onSelectBonusSkill = useCallback((skill: string, isSelected: boolean) => {
        if (isSelected && chosenBonusSkills.length < ancestryTrainingMaxChoices) {
            setChosenBonusSkills([...chosenBonusSkills, skill])
        }
        else {
            setChosenBonusSkills(chosenBonusSkills.filter(sk => sk !== skill))
        }
    }, [chosenBonusSkills, ancestryTrainingMaxChoices])

    const TrainingSelection = ({ stats }: { stats: { stat: string, value: number }[] }) => {
        return (
            <div className="bg-sheet-main-fill space-y-4">
                {/* HEADER AND NAVIGATION BUTTONS */}
                <NavButtons header={<Header title={strings.traingingsHeader} />} />
                <div className="items-center justify-center text-center w-full space-y-2">
                    <HeroCreationSubtext text={strings.trainingSubheader} />

                    {/* SELECTED STATS W/ BONUSES APPLIED */}
                    <HeroCreationSubtext text={
                        stats.map(s => `${vgLiteLang.Stat[s.stat].abbr}: ${s.value}`).join(" | ")
                    } />

                    <Divider />
                </div>

                {/* GRANTED TRAININGS LIST */}
                <div className="space-y-1">
                    <HeroCreationLabel text={strings.grantedTraining} />
                    {
                        requiredTrainingRules.map((rule, index) => (
                            <ItemGrantCard key={index} name={vgLiteLang.Skills[rule.skill].name} subtext={`(${vgLiteLang.Skills[rule.skill].stat})`} source={rule.source.name} />
                        ))
                    }
                </div>

                {/* TRAINING CHOICE COUNTER */}
                <div className="justify-center text-center bg-context-menu-fill/25">
                    <BorderedContent className="flex-col gap-y-2 justify-center w-full">
                        <HeroCreationSubtext text={strings.trainingSlots} />
                        <p className="text-4xl text-text-header-tertiary font-bold">{`${chosenClassSKills.length} / ${classTrainingMaxChoices} ${strings.selected}`}</p>
                    </BorderedContent>
                </div>

                {/* CLASS TRAINING SELECTIONS */}
                <div className="space-y-1 mt-2">
                    <HeroCreationLabel text={strings.electiveTraining.replace("%s", `${classTrainingMaxChoices}`)} />
                    {
                        classTrainingRules
                            .flatMap(r => r.choices)
                            .filter(choice => !chosenBonusSkills.includes(getSKillNameFromPath(choice.value)))
                            .map(choice => {
                                const skill = getSKillNameFromPath(choice.value)
                                const isSelected = chosenClassSKills.includes(skill)
                                return (
                                    <TrainingSelector
                                        key={choice.value}
                                        skill={skill}
                                        label={choice.label}
                                        isSelected={isSelected}
                                        onSelect={() => onSelectClassSkill(skill, !isSelected)}
                                    />
                                )
                            })
                    }
                </div>

                {/* BONUS TRAINING SELECTIONS */}
                {
                    ancestryTrainingRules.length > 0 &&
                    <BonusChoiceContainer>
                        {
                            ancestryTrainingRules.map(rule => (
                                <div key={rule.value} className="space-y-1">
                                    <BonusChoiceTitle text={`${strings.bonusTraining.replace("%s1", `${ancestry?.name} ${rule.label}`).replace("%s2", rule.maxChoices.toString())}`} />
                                    {
                                        rule.maxChoices > chosenBonusSkills.length ?
                                            rule.choices.map(c => (
                                                { value: c.value, label: c.label }
                                            )).filter(c =>
                                                !chosenClassSKills.includes(getSKillNameFromPath(c.value)) &&
                                                !requiredTrainingRules.map(r => r.skill).includes(getSKillNameFromPath(c.value))
                                            ).map(choice => {
                                                const skill = getSKillNameFromPath(choice.value)
                                                const isSelected = chosenBonusSkills.includes(skill)
                                                return (
                                                    <TrainingSelector
                                                        key={choice.value}
                                                        skill={skill}
                                                        label={choice.label}
                                                        isSelected={isSelected}
                                                        onSelect={() => onSelectBonusSkill(skill, !isSelected)}
                                                    />
                                                )
                                            }) :
                                            chosenBonusSkills.map(skill => (
                                                <TrainingSelector
                                                    key={skill}
                                                    skill={skill}
                                                    label={vgLiteLang.Skills[skill].name}
                                                    isSelected={true}
                                                    onSelect={() => onSelectBonusSkill(skill, false)}
                                                />
                                            ))
                                    }
                                </div>
                            ))
                        }
                        </BonusChoiceContainer>
                }
            </div>
        )
    }

    return { TrainingSelection, classTrainingRules, ancestryTrainingRules, chosenClassSKills, chosenBonusSkills }
}