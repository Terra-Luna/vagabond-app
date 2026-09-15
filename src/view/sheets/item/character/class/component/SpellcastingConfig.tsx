import { useEffect } from "react"

import { ClassDataModel } from "../../../../../../model/item/character/ClassDataModel"
import { appLang } from "../../../../../../utils/lang"
import { createDropdownEntriesFromObj } from "../../../../../../utils/localeUtils"
import { DropDown } from "../../../../../component/Dropdown"
import { useEditMode } from "../../../../../context/EditModeContext/Hooks"
import { ClassSheetLabel, ClassSheetText } from "./ClassSheetText"

export const SpellcastingSkillSelector = ({ item }: { item: Item & { system: ClassDataModel } }) => {
    const { isEditMode } = useEditMode()
    useEffect(() => { item?.render(true) }, [item?.system?.castingSkill])

    return (
        <div className="flex gap-x-1 items-center">
            {(isEditMode || item.system.castingSkill) && <>
                <ClassSheetLabel text={`${appLang.ClassSheet.labelSpellSkill}:`} />
                <DropDown
                    value={item.system.castingSkill}
                    options={createDropdownEntriesFromObj(appLang.Skills)}
                    includeNullOption={true}
                    updateMechanism={{ updatePath: ['castingSkill'] }}
                    parent={item}
                />
            </>}
            <ClassSheetText text={appLang.Stat[item.system.castingSkill ?? '']?.name} />
        </div>
    )
}

export const MaxCastFormulaSelector = ({ item }: { item: Item & { system: ClassDataModel } }) => {
    return (<>
        {item.system.castingSkill &&
            <div className="flex gap-x-1 items-center">
                <ClassSheetLabel text={`${appLang.ClassSheet.labelMaxMana}:`} />
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