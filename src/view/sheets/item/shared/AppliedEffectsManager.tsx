import { VagabondActiveEffect } from "../../../../combat/documents/VagabondActiveEffect"
import { DieSizeSelector } from "../../../../combat/ui/DieSizeSelector"
import { appLang } from "../../../../utils/lang"
import { tableBorderRounded } from "../../../common/border-styles"
import { UtilityButton } from "../../../component/Button"
import { TrashButton } from "../../../component/TrashButton"
import { ItemSheetPropLabel } from "../equip/component/ItemSheetLabelComponent"

export const AppliedEffectsManager = ({ item }) => {
    const appliedEffects = item.system.appliedEffects || []
    const statusEffectChoices = VagabondActiveEffect.statusEffects.map(it => it.id)

    const updateDocument = async (newEffects) => {
        await item.update({ 'system.appliedEffects': newEffects })
    }

    const handleAddEffect = async () => {
        const newEffect = { effect: statusEffectChoices[0] || "" }
        await updateDocument([...appliedEffects, newEffect])
    }

    const handleRemoveEffect = async (indexToRemove) => {
        const updatedEffects = appliedEffects.filter((_, index) => index !== indexToRemove)
        await updateDocument(updatedEffects)
    }

    const handleFieldChange = async (indexToUpdate, field, value) => {
        const updatedEffects = appliedEffects.map((item, index) => {
            if (index !== indexToUpdate) return item
            return { ...item, [field]: value }
        })
        await updateDocument(updatedEffects)
    }

    return (
        <div className="flex flex-col gap-2 w-full">
            {/* Header / Add Button Row */}
            <div className="flex items-center gap-2">
                <ItemSheetPropLabel label={appLang.ItemSheet.effects} />
                <UtilityButton title="Add applied effect" onClick={handleAddEffect}>
                    {appLang.ButtonActions.add}
                </UtilityButton>
            </div>

            {/* Render rows if effects exist */}
            {appliedEffects.length > 0 && (
                <div className="flex flex-col gap-2">
                    {appliedEffects.map((applied, index) => (
                        <div key={`${applied.effect}-${index}`} className="flex items-center gap-2 font-eskapade font-bold">

                            {/* Effect selector */}
                            <select
                                value={applied.effect}
                                onChange={(e) => handleFieldChange(index, 'effect', e.target.value)}
                                className={`text-sm px-2 py-1 focus:outline-none ${tableBorderRounded}`}
                            >
                                {statusEffectChoices.map(id => (
                                    <option key={id} value={id}>{appLang.StatusConditions[id].name}</option>
                                ))}
                            </select>

                            {/* Duration */}
                            <div title="Countdown Die">
                                <DieSizeSelector
                                    value={applied.duration}
                                    onChange={(value) => handleFieldChange(index, 'duration', Number(value))}
                                />
                            </div>

                            {/* Crit duration */}
                            <div title="Countdown Die (on Crit)">
                                <DieSizeSelector
                                    value={applied.critDuration}
                                    onChange={(value) => handleFieldChange(index, 'critDuration', Number(value))}
                                />
                            </div>

                            {/* Delete button */}
                            <TrashButton title="Remove effect" onDelete={() => handleRemoveEffect(index)} />

                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}