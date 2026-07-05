import { AlchemicalItemDataModel } from "../../../../../model/item/equip/AlchemicalItemDataModel"
import { DropDown } from "../../../../component/Dropdown"
import { DamageType, ExplodingDiceItemConfig, ItemDamageTextField } from "./WeaponSheet"
import { createDropdownEntriesFromObj } from "../../../../../utils/localeUtils"
import { ConsumableToggle, EquipmentSheetSubtypeBody, ItemSheetPropLabel, ItemSheetPropValue } from "../EquipmentSheetComponent"
import { lang as fullLang } from "../../../../../utils/lang"
import { EditableTextField } from "../../../../component/EditableTextField"
import { Checkbox } from "../../../../component/Checkbox"
import { useEditMode } from "../../../../context/EditModeContext/Hooks"
const lang = fullLang.VGLITE

export const AlchemicalSheet = ({ item }: { item: Item & { system: AlchemicalItemDataModel } }) => {
    const { isEditMode } = useEditMode()
    return (
        <EquipmentSheetSubtypeBody>
            <div className="space-y-4">
                <div className="flex gap-x-8 justify-start items-start">
                    {
                        !isEditMode && item.system.damage.type === 'none' ? <></> :
                            <DamageType item={item} />
                    }
                    {
                        item.system.damage.type === 'none' ? <></> :
                            <div className="flex gap-x-8 items-top">
                                <div>
                                    <ItemSheetPropLabel
                                        label={`
                                            ${item.system.damage.type === 'healing' ?
                                                lang.DamageTypes.healing :
                                                (item.system.damage.type === 'mana' ? lang.DamageTypes.mana :
                                                    lang.ItemSheet.damage
                                                )
                                            }
                                        `}
                                    />
                                    <ItemDamageTextField item={item} label={''} path={'oneHand'} />
                                </div>
                                {
                                    isEditMode || item.system.damage.appliesBurn ?
                                        <div>
                                            <Checkbox
                                                label={lang.ItemSheet.burn}
                                                onCheckedChanged={() =>
                                                    item.update({ 'system.damage.appliesBurn': !item.system.damage.appliesBurn } as Record<string, boolean>)
                                                }
                                                checked={item.system.damage.appliesBurn}
                                            />
                                            <ItemSheetPropLabel label={lang.ItemSheet.duration} />
                                            <ItemSheetPropValue value={
                                                <EditableTextField
                                                    boundValue={item.system.damage.burnCountdown}
                                                    updateProps={{ object: item, path: ['damage', 'burnCountdown'] }}
                                                    placeholder="Cd4"
                                                />
                                            } />
                                        </div> : <></>
                                }
                            </div>
                    }
                </div>
                <ConsumableToggle item={item} />
                <ExplodingDiceItemConfig item={item} />
                <div className="flex items-center">
                    <AlechemyCategory item={item} />
                </div>
            </div>
        </EquipmentSheetSubtypeBody>
    )
}

const AlechemyCategory = ({ item }: { item: Item & { system: AlchemicalItemDataModel } }) => {
    return (
        <DropDown
            label={lang.ItemSheet.alchCategory}
            value={item.system.alchemyCategory}
            options={createDropdownEntriesFromObj(lang.AlchemyCategories)}
            updateMechanism={{ updatePath: ['alchemyCategory'] }}
            parent={item}
        />
    )
}