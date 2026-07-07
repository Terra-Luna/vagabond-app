import { ClassDataModel } from "../../../../../../model/item/character/ClassDataModel"
import { vgLiteLang } from "../../../../../../utils/lang"
import { EditableTextField } from "../../../../../component/EditableTextField"
import { useEditMode } from "../../../../../context/EditModeContext/Hooks"
import { ClassSheetSelectionMenu } from "./ClassSheetSelectionMenu"
import { ClassSheetLabel, ClassSheetSectionHeader, ClassSheetText } from "./ClassSheetText"

export const TrainingsConfig = ({ item }: { item: Item & { system: ClassDataModel } }) => {
    const { isEditMode } = useEditMode()
    return (
        <div className="mt-4">
            <ClassSheetSectionHeader text={"Training"} />
            <div className="flex gap-x-1">
                <ClassSheetLabel text={"Weapons:"} />
                {isEditMode ? <WeaponTrainingSelections item={item} /> : <></>}
                <ClassSheetText text={item.system.training.weaponTraining.map(k => vgLiteLang.Skills[k].name).join(", ")} />
            </div>
            <div className="flex flex-wrap gap-x-1">
                <ClassSheetLabel text={"Skills:"} />
                {isEditMode ? <RequiredSkillsSelections item={item} /> : <></>}
                <ClassSheetText text={item.system.training.requiredTraining.map(k => vgLiteLang.Skills[k].name).join(", ")} />
                {
                    item.system.training.requiredTraining.length > 0 ?
                        <ClassSheetText text={"and"} /> : <></>
                }
                <SkillElectiveTrainingCount item={item} />
                <ClassSheetText text={"from"} />
                {isEditMode ? <OptionalTraingingSelections item={item} /> : <></>}
                <ClassSheetText text={item.system.training.electivePoolOptions.map(k => vgLiteLang.Skills[k]?.name ?? "Any").join(", ")} />
            </div>
        </div>
    )
}

const WeaponTrainingSelections = ({ item }: { item: Item & { system: ClassDataModel } }) => {
    return (
        <ClassSheetSelectionMenu item={item} path={['training', 'weaponTraining']} options={
            weaponSkillKeys.map(k => (
                { key: k, value: vgLiteLang.Skills[k].name, isSelected: item.system.training.weaponTraining.includes(k as any) }
            ))
        } />
    )
}

const RequiredSkillsSelections = ({ item }: { item: Item & { system: ClassDataModel } }) => {
    return (
        <ClassSheetSelectionMenu item={item} path={['training', 'requiredTraining']} options={
            nonWeaponSKillKeys.map(k => (
                { key: k, value: vgLiteLang.Skills[k].name, isSelected: item.system.training.requiredTraining.includes(k as any) }
            ))
        } />
    )
}

const OptionalTraingingSelections = ({ item }: { item: Item & { system: ClassDataModel } }) => {
    const optionKeys = Object.keys(vgLiteLang.Skills).filter(k =>
        !item.system.training.weaponTraining.includes(k as any) &&
        !item.system.training.requiredTraining.includes(k as any)
    )
    optionKeys.push('any')

    return (
        <ClassSheetSelectionMenu item={item} path={['training', 'electivePoolOptions']} options={
            optionKeys.map(k => (
                { key: k, value: vgLiteLang.Skills[k]?.name || "Any", isSelected: item.system.training.electivePoolOptions.includes(k as any) }
            ))
        } />
    )
}

const SkillElectiveTrainingCount = ({ item }: { item: Item & { system: ClassDataModel } }) => {
    return (
        <div className="text-lg font-eskapade font-bold">
            <EditableTextField
                boundValue={item.system.training.electiveTrainingCount.toString()}
                updateProps={{ object: item, path: ['training', 'electiveTrainingCount'] }}
                placeholder={"3"}
            />
        </div>
    )
}

const weaponTrainings = ['melee', 'ranged', 'finesse', 'brawl']
const weaponSkillKeys = Object.keys(vgLiteLang.Skills).filter(k => weaponTrainings.includes(k))
const nonWeaponSKillKeys = Object.keys(vgLiteLang.Skills).filter(k => !weaponTrainings.includes(k))