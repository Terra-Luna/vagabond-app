import { Plus, Trash } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { PerkDataModel, addPerkPrerequisite, deletePerkPrerequisite } from "../../../../../model/item/character/PerkDataModel"
import { vgLiteLang } from "../../../../../utils/lang"
import { createDropdownEntries, createDropdownEntriesFromObj, createDropdownEntriesForItems } from "../../../../../utils/localeUtils"
import { andOrToSymbol } from "../../../../../utils/stringUtil"
import { DropDown } from "../../../../component/Dropdown"
import { SingleSelect } from "../../../../component/SingleSelect"
import { useEditMode } from "../../../../context/EditModeContext/Hooks"
import { ItemSheetPropLabel } from "../../equip/component/ItemSheetLabelComponent"
import { BaseSkillSheetComponent } from "./shared/BaseSkillSheetComponent"
import { ItemRulesManager } from "../../../../component/rules/ItemRulesManager"

export const PerkSheetReactComponent = ({ item }: { item: Item & { system: PerkDataModel } }) => {
    const { isEditMode } = useEditMode()

    return (<>
        <BaseSkillSheetComponent item={item} content={
            <div className="w-full">
                <div className="flex gap-x-2 items-center">
                    {
                        isEditMode ? <>
                            <ItemSheetPropLabel label={vgLiteLang.ItemSheet.prerequisites} className={"font-bold"} />
                            <Plus size={20} strokeWidth={3} className="text-stat-block-fill cursor-pointer"
                                onClick={() => addPerkPrerequisite(item)}
                            /></> : <></>
                    }
                </div>
                {
                    !isEditMode ? <></> :
                        <div className="space-y-0.5 mb-8">
                            {
                                item.system.prerequisites.map((_, index) => (
                                    <Prerequisite key={index} perk={item} prereqIndex={index} />
                                ))
                            }
                        </div>
                }
                <div className="mt-4">
                    <ItemRulesManager item={item} />
                </div>
            </div>
        } />
    </>)
}

const Prerequisite = ({ perk, prereqIndex }: { perk: Item & { system: PerkDataModel }, prereqIndex: number }) => {
    const { isEditMode } = useEditMode()
    const prereq = perk.system.prerequisites[prereqIndex]
    const [spellDropdownItems, setSpellDropdownItems] = useState<{ value: string, label: string }[]>([])

    useEffect(() => {
        createDropdownEntriesForItems('spell', true).then((spells) => {
            setSpellDropdownItems(spells)
        })
    })

    const onUpdateType = useCallback((type) => {
        perk.update({
            'system.prerequisites': perk.system.prerequisites.map((prereq, i) => {
                if (i === prereqIndex) return { ...prereq, type: type }
                else return { ...prereq }
            })
        } as Record<string, any[]>)
    }, [perk.system.prerequisites])

    const onUpdateStat = useCallback((stat) => {
        perk.update({
            'system.prerequisites': perk.system.prerequisites.map((prereq, i) => {
                if (i === prereqIndex) return { ...prereq, stat: stat }
                else return { ...prereq }
            })
        } as Record<string, any[]>)
    }, [perk.system.prerequisites])

    const onUpdateValue = useCallback((val) => {
        perk.update({
            'system.prerequisites': perk.system.prerequisites.map((prereq, i) => {
                if (i === prereqIndex) return { ...prereq, value: val }
                else return { ...prereq }
            })
        } as Record<string, any[]>)
    }, [perk.system.prerequisites])

    const onUpdateSpell = useCallback((spell) => {
        perk.update({
            'system.prerequisites': perk.system.prerequisites.map((prereq, i) => {
                if (i === prereqIndex) return { ...prereq, spell: spell }
                else return { ...prereq }
            })
        } as Record<string, any>)
    }, [perk.system.prerequisites])

    const onUpdateTrainedSkill = useCallback((skillGroupIndex, skillIndex, newSkill) => {
        const currentSkillGroup = prereq.skills[skillGroupIndex]
        const updatedSkillNames = currentSkillGroup.skillNames.map((sk, skIndex) => {
            if (skIndex === skillIndex) return newSkill
            else return sk
        }) as string[]
        const updatedSkillGroup = { skillNames: updatedSkillNames, andOr: currentSkillGroup.andOr }
        const updatedSkills = prereq.skills.map((skgrp, i) => {
            if (i === skillGroupIndex) return { ...updatedSkillGroup }
            else return { ...skgrp }
        })
        const updatedPrereqs = perk.system.prerequisites.map((prereq, i) => {
            if (i === prereqIndex) return { ...prereq, skills: updatedSkills }
            else return { ...prereq }
        })
        perk.update({ 'system.prerequisites': updatedPrereqs } as Record<string, any[]>)
    }, [perk.system.prerequisites])

    const onUpdateAndOr = useCallback((skillGroupIndex, andOr) => {
        const currentSkillGroup = prereq.skills[skillGroupIndex]
        const updatedSkillGroup = { skillNames: currentSkillGroup.skillNames, andOr: andOr }
        const updatedSkills = prereq.skills.map((skgrp, i) => {
            if (i === skillGroupIndex) return { ...updatedSkillGroup }
            else return { ...skgrp }
        })
        const updatedPrereqs = perk.system.prerequisites.map((prereq, i) => {
            if (i === prereqIndex) return { ...prereq, skills: updatedSkills }
            else return { ...prereq }
        })
        perk.update({ 'system.prerequisites': updatedPrereqs } as Record<string, any[]>)
    }, [perk.system.prerequisites])

    const onAddTrainedSkill = useCallback((skillGroupIndex) => {
        const currentSkillGroup = prereq.skills[skillGroupIndex]
        currentSkillGroup.skillNames.push(Object.keys(vgLiteLang.Skills)[0])
        perk.render()
    }, [perk.system.prerequisites])

    return (
        <div className="flex gap-x-1 items-end">
            {
                isEditMode ? <Trash size={20} className="text-destructive-action mr-2 mb-1 cursor-pointer" onClick={() => deletePerkPrerequisite(perk, prereqIndex)} /> : <></>
            }
            {
                isEditMode || prereq.type !== 'stat' ?
                    <div className="flex items-end">
                        <DropDown
                            value={prereq.type}
                            options={createDropdownEntries(vgLiteLang.PrerequisiteTypes)}
                            updateMechanism={{ onChange: onUpdateType }}
                            parent={perk}
                        />
                        <p className="text-lg text-text-secondary font-eskapade font-bold mb-0.5">:</p>
                    </div> : <></>
            }
            {
                prereq.type === 'stat' ?
                    <div className="flex items-end gap-x-1">
                        <DropDown
                            value={prereq.stat}
                            options={createDropdownEntriesFromObj(vgLiteLang.Stat)}
                            updateMechanism={{ onChange: onUpdateStat }}
                            parent={perk}
                        />
                        <DropDown
                            value={prereq.value?.toString() ?? ''}
                            options={[
                                { label: "3+", value: "3" },
                                { label: "4+", value: "4" },
                                { label: "5+", value: "5" },
                                { label: "6+", value: "6" },
                                { label: "7", value: "7" }
                            ]}
                            updateMechanism={{ onChange: onUpdateValue }}
                            parent={perk}
                        />
                    </div> : <></>
            }
            {
                prereq.type === 'spell' ?
                    <DropDown
                        value={prereq.spell}
                        options={spellDropdownItems}
                        updateMechanism={{ onChange: onUpdateSpell }}
                        parent={perk}
                    /> : <></>
            }
            {
                prereq.type === 'trained' ?
                    <>
                        {
                            prereq.skills.map((skillsGroup, skillGroupIndex) => (
                                <div key={skillGroupIndex} className="flex gap-x-1 items-end">
                                    {
                                        skillsGroup.skillNames.map((skill, skillIndex) => (
                                            <div key={skillGroupIndex + skillIndex + skill} className="flex gap-x-1 items-end">
                                                <DropDown
                                                    value={skill}
                                                    options={createDropdownEntriesFromObj(vgLiteLang.Skills)}
                                                    updateMechanism={{ onChange: (skill) => onUpdateTrainedSkill(skillGroupIndex, skillIndex, skill) }}
                                                    parent={perk}
                                                />
                                                {
                                                    isEditMode && skillsGroup.skillNames.length > 1 && skillIndex < skillsGroup.skillNames.length - 1 ?
                                                        <SingleSelect
                                                            options={[
                                                                { value: 'and', label: vgLiteLang.PerkSheet.prereqAnd },
                                                                { value: 'or', label: vgLiteLang.PerkSheet.prereqOr }
                                                            ]}
                                                            value={skillsGroup.andOr}
                                                            setValue={(selection) => onUpdateAndOr(skillGroupIndex, selection)}
                                                            canUnselect={true}
                                                        /> :
                                                        <div>
                                                            {
                                                                skillsGroup.skillNames.length > 1 && skillIndex < skillsGroup.skillNames.length - 1 ?
                                                                    <p className="text-text-secondary mb-1">{andOrToSymbol(skillsGroup.andOr)}</p> : <></>
                                                            }
                                                        </div>
                                                }
                                                {
                                                    isEditMode && skillIndex === skillsGroup.skillNames.length - 1 ?
                                                        <Plus size={20} strokeWidth={3} className="text-stat-block-fill cursor-pointer mb-1"
                                                            onClick={() => onAddTrainedSkill(skillGroupIndex)}
                                                        /> : <></>
                                                }
                                            </div>
                                        ))
                                    }
                                </div>
                            ))
                        }
                    </> : <></>
            }
        </div>
    )
}