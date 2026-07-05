import SpellDataModel from "../../../../../model/item/character/SpellDataModel"
import { vgLiteLang } from "../../../../../utils/lang"
import { createDropdownEntries } from "../../../../../utils/localeUtils"
import { Checkbox } from "../../../../component/Checkbox"
import { DropDown } from "../../../../component/Dropdown"
import { EditableTextField } from "../../../../component/EditableTextField"
import { useEditMode } from "../../../../context/EditModeContext/Hooks"
import { ItemSheetPropLabel, ItemSheetPropValue } from "../../equip/EquipmentSheetComponent"
import { BaseSkillSheetComponent } from "./shared/BaseSkillSheetComponent"

export const SpellSheetReactComponent = ({ item }: { item: Item & { system: SpellDataModel } }) => {
    const { isEditMode } = useEditMode()
    return (
        <BaseSkillSheetComponent item={item} content={<>
            <div className="space-y-4">
                {isEditMode ? <DamageTypeSelection spell={item} /> : <></>}
                {isEditMode || item.system.appliesBurn ? <BurnSettings spell={item} /> : <></>}
            </div>
        </>} />
    )
}

const DamageTypeSelection = ({ spell }: { spell: Item & { system: SpellDataModel } }) => {
    return (
        <div className="gap-y-4">
            <ItemSheetPropLabel label={vgLiteLang.ItemSheet.damageType} />
            <DropDown
                value={spell.system.damageType}
                options={createDropdownEntries(vgLiteLang.DamageTypes)}
                updateMechanism={{ updatePath: ['damageType'] }}
                parent={spell}
            />
        </div>
    )
}

const BurnSettings = ({ spell }: { spell: Item & { system: SpellDataModel } }) => {
    return (
        <div className="flex gap-x-2">
            <Checkbox
                label={vgLiteLang.ItemSheet.burn}
                onCheckedChanged={() => spell.update({ 'system.appliesBurn': !spell.system.appliesBurn } as Record<string, boolean>)}
                checked={spell.system.appliesBurn}
            />
            <div className="flex gap-x-2">
                <ItemSheetPropLabel label={vgLiteLang.ItemSheet.duration} />
                <ItemSheetPropValue value={
                    <EditableTextField
                        boundValue={spell.system.burnCountdown}
                        updateProps={{ object: spell, path: ['burnCountdown'] }}
                        placeholder="Cd4"
                    />
                } />
            </div>
        </div>
    )
}