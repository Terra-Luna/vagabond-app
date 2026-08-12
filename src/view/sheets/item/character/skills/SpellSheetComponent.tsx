import { SpellDataModel } from "../../../../../model/item/character/SpellDataModel"
import { vgLiteLang } from "../../../../../utils/lang"
import { Checkbox } from "../../../../component/Checkbox"
import { useEditMode } from "../../../../context/EditModeContext/Hooks"
import { ItemSheetPropLabel } from "../../equip/component/ItemSheetLabelComponent"
import { BaseSkillSheetComponent } from "./shared/BaseSkillSheetComponent"
import { AppliedEffectsManager } from "../../shared/AppliedEffectsManager"
import { DamageTypeSelector } from "../../shared/DamageTypeSelector"

export const SpellSheetComponent = ({ item }: { item: Item & { system: SpellDataModel } }) => {
    const { isEditMode } = useEditMode()
    return (
        <BaseSkillSheetComponent item={item} content={
            <div className="space-y-4 pb-4">
                {isEditMode &&
                    <div className="space-y-4">
                        <div className="flex gap-x-8 items-end">
                            <DamageTypeSelector item={item} path={'system.damageType'} />
                            <div>
                                <ItemSheetPropLabel label={vgLiteLang.ItemSheet.baseManaCost} />
                                <input
                                    type="number"
                                    value={item.system.baseManaCost}
                                    onChange={(e) => item.update({ 'system.baseManaCost': Number(e.target.value) } as Record<string, number>)}
                                    className="border border-solid border-table-border font-eskapade font-bold px-2 max-w-[8ch]"
                                />
                            </div>
                        </div>
                        <Checkbox
                            label={vgLiteLang.ItemSheet.ignoreEffCost}
                            checked={item.system.ignoreEffectCost}
                            onCheckedChanged={(isChecked) => item.update({ 'system.ignoreEffectCost': isChecked } as Record<string, boolean>)}
                        />
                        <AppliedEffectsManager item={item} />
                    </div>
                }
            </div>
        } />
    )
}

