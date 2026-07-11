import { useCallback, useEffect, useState } from "react"
import { ClassDataModel } from "../../../../../../model/item/character/ClassDataModel"
import { vgLiteLang } from "../../../../../../utils/lang"
import { createDropdownEntriesFromObj } from "../../../../../../utils/localeUtils"
import { DropDown } from "../../../../../component/Dropdown"
import { useEditMode } from "../../../../../context/EditModeContext/Hooks"
import { ClassSheetLabel, ClassSheetText } from "./ClassSheetText"
import { EditableTextField } from "../../../../../component/EditableTextField"
import { MultiSelect, SelectOption } from "../../../../../component/MultiSelect"
import { CombinedItems } from "../../../../../../utils/modelUtil"
import { MultiValue } from "react-select"

export const SpellcastingSkillSelector = ({ item }: { item: Item & { system: ClassDataModel } }) => {
    const { isEditMode } = useEditMode()
    useEffect(() => { item.render(true) }, [item.system.castingSkill])

    return (
        <div className="flex gap-x-1">
            {
                isEditMode || item.system.castingSkill ? 
                    <>
                        <ClassSheetLabel text={`${vgLiteLang.ClassSheet.labelSpellSkill}:`} />
                        <DropDown
                            value={item.system.castingSkill}
                            options={createDropdownEntriesFromObj(vgLiteLang.Skills)}
                            includeNullOption={true}
                            updateMechanism={{ updatePath: ['castingSkill'] }}
                            parent={item}
                        />
                    </> : <></>
            }
            <ClassSheetText text={vgLiteLang.Stat[item.system.castingSkill ?? '']?.name} />
        </div>
    )
}

export const ManaStatSelector = ({ item }: { item: Item & { system: ClassDataModel } }) => { 
    const { isEditMode } = useEditMode()
    return (
        <>
            {
                isEditMode || item.system.castingSkill ?
                    <div className="flex gap-x-1">
                        <ClassSheetLabel text={`${vgLiteLang.ClassSheet.labelMaxMana}:`} />
                        <DropDown
                            value={item.system.maxManaStat}
                            options={createDropdownEntriesFromObj(vgLiteLang.Stat)}
                            includeNullOption={true}
                            updateMechanism={{ updatePath: ['maxManaStat'] }}
                            parent={item}
                        />
                    </div> : <></>
            }
        </>
    )
}

export const MaxManaPerLevelSelector = ({ item }: { item: Item & { system: ClassDataModel } }) => {
    const { isEditMode } = useEditMode()
    return (
        <>
            {
                isEditMode || item.system.castingSkill ?
                    <div className="flex gap-x-1">
                        <ClassSheetLabel text={`${vgLiteLang.ClassSheet.labelManaLevel}:`} />
                        <DropDown
                            value={item.system.manaMultiplier?.toString()}
                            options={[
                                { label: '-', value: '0' },
                                { label: '1', value: '1' },
                                { label: '2', value: '2' },
                                { label: '3', value: '3' },
                                { label: '4', value: '4' }
                            ]}
                            updateMechanism={{ updatePath: ['manaMultiplier'] }}
                            parent={item}
                        />
                    </div> : <></>
            }
        </>
    )
}

export const StartingSpellSlotsInput = ({ item }: { item: Item & { system: ClassDataModel } }) => {
    const { isEditMode } = useEditMode()
    return (
        <>
            {
                isEditMode || item.system.castingSkill ?
                    <div className="flex gap-x-1">
                        <ClassSheetLabel text={`${vgLiteLang.ClassSheet.startingSpellSlots}:`} />
                        <EditableTextField
                            boundValue={item.system.spellsGained?.toString() ?? '0'}
                            updateProps={{ object: item, path: ['spellsGained'] }}
                            placeholder={'4'}
                            className={"text-xl font-eskapade font-normal"}
                        />
                    </div> : <></>
            }
        </>
    )
}

export const RequiredStartingSpells = ({ item }: { item: Item & { system: ClassDataModel } }) => {
    const { isEditMode } = useEditMode()
    const [allSpellOpts, setAllSpellOpts] = useState<SelectOption[]>([])

    useEffect(() => {
        CombinedItems('spell').then((spells) => {
            setAllSpellOpts(spells.map(s => ({
                value: s.id as string,
                label: s.name
            })))
        })
    }, [])

    const savedSpellIds: string[] = item.system.requiredSpells || []
    const selectedSpells = allSpellOpts.filter(opt => savedSpellIds.includes(opt.value))
    const availableSpellOpts = allSpellOpts.filter(opt => !savedSpellIds.includes(opt.value))

    const handleSpellSelect = useCallback((values: MultiValue<SelectOption>) => {
        const updatedIds = values.map(v => v.value)
        item.update({ 'system.requiredSpells': updatedIds } as Record<string, string[]>)
    }, [item])

    return (
        <>
            {
                isEditMode || item.system.castingSkill ? (
                    <div className="flex gap-x-1">
                        <ClassSheetLabel text={`${vgLiteLang.ClassSheet.requiredSpells}:`} />
                        <MultiSelect
                            options={availableSpellOpts}
                            value={selectedSpells}
                            handleOnChange={handleSpellSelect}
                        />
                    </div>
                ) : <></>
            }
        </>
    )
}

export const SpellGainLevelInterval = ({ item }: { item: Item & { system: ClassDataModel } }) => {
    const { isEditMode } = useEditMode()
    return (
        <>
            {
                isEditMode || item.system.castingSkill ?
                    <div className="flex gap-x-1">
                        <ClassSheetLabel text={`${vgLiteLang.ClassSheet.spellGainLvlInterval}:`} />
                        <EditableTextField
                            boundValue={item.system.spellGainInterval?.toString() ?? '0'}
                            updateProps={{ object: item, path: ['spellGainInterval'] }}
                            placeholder={'4'}
                            className={"text-xl font-eskapade font-normal"}
                        />
                    </div> : <></>
            }
        </>
    )
}