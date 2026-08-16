import { useEffect } from "react"
import { ClassDataModel } from "../../../../../../model/item/character/ClassDataModel"
import { vgLiteLang } from "../../../../../../utils/lang"
import { createDropdownEntriesFromObj } from "../../../../../../utils/localeUtils"
import { DropDown } from "../../../../../component/Dropdown"
import { useEditMode } from "../../../../../context/EditModeContext/Hooks"
import { ClassSheetLabel, ClassSheetText } from "./ClassSheetText"

export const SpellcastingSkillSelector = ({ item }: { item: Item & { system: ClassDataModel } }) => {
    const { isEditMode } = useEditMode()
    useEffect(() => { item?.render(true) }, [item?.system?.castingSkill])

    return (
        <div className="flex gap-x-1 items-center">
            {(isEditMode || item.system.castingSkill) &&
                <>
                    <ClassSheetLabel text={`${vgLiteLang.ClassSheet.labelSpellSkill}:`} />
                    <DropDown
                        value={item.system.castingSkill}
                        options={createDropdownEntriesFromObj(vgLiteLang.Skills)}
                        includeNullOption={true}
                        updateMechanism={{ updatePath: ['castingSkill'] }}
                        parent={item}
                    />
                </>}
            <ClassSheetText text={vgLiteLang.Stat[item.system.castingSkill ?? '']?.name} />
        </div>
    )
}

export const MaxCastFormulaSelector = ({ item }: { item: Item & { system: ClassDataModel } }) => {
    return (<>
        {item.system.castingSkill &&
            <div className="flex gap-x-1 items-center">
                <ClassSheetLabel text={`${vgLiteLang.ClassSheet.labelMaxMana}:`} />
                <DropDown
                    value={item.system.maxCastFormula}
                    options={[{ value: "half", label: '1 + ⌈Level / 2⌉' }, { value: 'full', label: '2 + Level' }]}
                    includeNullOption={true}
                    updateMechanism={{ updatePath: ['maxCastFormula'] }}
                    parent={item}
                />
            </div>
        }
    </>)
}

export const MaxManaPerLevelSelector = ({ item }: { item: Item & { system: ClassDataModel } }) => {
    const { isEditMode } = useEditMode()
    return (
        <>
            {(isEditMode || item.system.castingSkill) &&
                <div className="flex gap-x-1 items-center">
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
                </div>
            }
        </>
    )
}