import { SpellDataModel } from "../../model/item/character/SpellDataModel";
import { AlchemicalItemDataModel } from "../../model/item/equip/AlchemicalItemDataModel";
import { appLang } from "../../utils/lang";
import { UtilityButton } from "../../view/component/Button";
import { CustomDropDown } from "../../view/component/Dropdown";
import { TrashButton } from "../../view/component/TrashButton";
import { useEditMode } from "../../view/context/EditModeContext/Hooks";
import { ItemSheetPropLabel } from "../../view/sheets/item/equip/component/ItemSheetLabelComponent";
import { VagabondActiveEffect } from "../documents/VagabondActiveEffect";

type AppliedEffect = { effect: string, duration?: string, critDuration?: string }

export const AppliedEffectInput = ({ item }: { item: Item & { system: AlchemicalItemDataModel | SpellDataModel } }) => {

    const { isEditMode } = useEditMode()
    const appliedEffects: AppliedEffect[] = item.system.appliedEffects ?? []
    const statusEffectChoices = VagabondActiveEffect.statusEffects.map(it => it.id)
    const statusEffectOptions = statusEffectChoices.map(id => ({ value: id, label: appLang.StatusConditions[id].name }))

    const updateEffects = async (newEffects: AppliedEffect[]) => {
        await item.update({ 'system.appliedEffects': newEffects } as Record<string, AppliedEffect[]>)
    }

    const handleAddEffect = async () => {
        const newEffect: AppliedEffect = { effect: statusEffectChoices[0] ?? "" }
        await updateEffects([...appliedEffects, newEffect])
    }

    const handleRemoveEffect = async (indexToRemove: number) => {
        await updateEffects(appliedEffects.filter((_, index) => index !== indexToRemove))
    }

    const handleFieldChange = async (indexToUpdate: number, field: keyof AppliedEffect, value: string) => {
        const updatedEffects = appliedEffects.map((applied, index) =>
            index === indexToUpdate ? { ...applied, [field]: value } : applied
        )
        await updateEffects(updatedEffects)
    }

    return (
        <div className="flex flex-col w-full">

            {(appliedEffects.length > 0 || isEditMode) &&
                <div className="flex gap-x-1">
                    <ItemSheetPropLabel label={"Applied Effects"} />
                </div>
            }

            {appliedEffects.length > 0 &&
                <div className="flex flex-col gap-0.5">
                    {appliedEffects.map((applied, index) => (
                        <div key={`${applied.effect}-${index}`} className="flex items-end gap-0.5 text-base font-eskapade font-normal">

                            <div title="Effect">
                                <CustomDropDown
                                    value={applied.effect}
                                    options={statusEffectOptions}
                                    onChange={(e) => handleFieldChange(index, 'effect', e.target.value)}
                                />
                            </div>

                            <p className="text-sm mr-1">:</p>

                            <div title="Duration">
                                {isEditMode && index === 0 && <p className="text-sm">Duration</p>}
                                <CustomDropDown
                                    value={applied.duration ?? ''}
                                    options={appLang.Duration}
                                    onChange={(e) => handleFieldChange(index, 'duration', e.target.value)}
                                />
                            </div>

                            {isEditMode && <>
                                <div title="Duration (on crit)">
                                    {index === 0 && <p className="text-sm">Crit</p>}
                                    <CustomDropDown
                                        value={applied.critDuration ?? ''}
                                        options={appLang.Duration}
                                        onChange={(e) => handleFieldChange(index, 'critDuration', e.target.value)}
                                    />
                                </div>
                                <TrashButton title="Remove effect" onClick={() => handleRemoveEffect(index)} />
                            </>}
                        </div>
                    ))}
                </div>
            }

            {isEditMode &&
                <div className="mt-0.5">
                    <UtilityButton title="Add applied effect" onClick={handleAddEffect}>
                        {appLang.ButtonActions.add}
                    </UtilityButton>
                </div>
            }
        </div>
    )
}