import { ClassDataModel } from "../../../../../../model/item/character/ClassDataModel"
import { vgLiteLang } from "../../../../../../utils/lang"
import { createDropdownEntriesFromObj } from "../../../../../../utils/localeUtils"
import { DropDown } from "../../../../../component/Dropdown"
import { EditableTextField } from "../../../../../component/EditableTextField"
import { useEditMode } from "../../../../../context/EditModeContext/Hooks"
import { ClassSheetLabel, ClassSheetText } from "./ClassSheetText"

export const SpellcastingSkillSelector = ({ item }: { item: Item & { system: ClassDataModel } }) => {
    const { isEditMode } = useEditMode()
    return (
        <div className="flex gap-x-1">
            {
                isEditMode || item.system.castingSkill ? 
                    <>
                        <ClassSheetLabel text={"Spellcasting Skill:"} />
                        <DropDown
                            value={item.system.castingSkill}
                            options={createDropdownEntriesFromObj(vgLiteLang.Skills)}
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
                        <ClassSheetLabel text={"Max Mana Stat:"} />
                        <DropDown
                            value={item.system.maxManaStat}
                            options={createDropdownEntriesFromObj(vgLiteLang.Stat)}
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
                        <ClassSheetLabel text={"Mana/Level:"} />
                        <DropDown
                            value={item.system.manaMultiplier?.toString()}
                            options={[
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