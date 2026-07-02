import { VGLITE as lang } from "../../../../../../public/lang/en.json"
import WeaponDataModel from "../../../../../model/item/equip/WeaponDataModel"
import { EquipmentSheetSubtypeBody, ItemSheetPropLabel, ItemSheetPropValue } from "../EquipmentSheet"
import { DropDown } from "../../../../component/Dropdown"
import { createDropdownEntries, createDropdownEntriesFromObj } from "../../../../../utils/localeUtils"
import { OptionsSelectionMenu, StringOptionsDisplay } from "../../../../component/OptionsSelectionMenu"
import { EditableTextField } from "../../../../component/EditableTextField"
import { Checkbox } from "../../../../component/Checkbox"
import { useCallback } from "react"
import { removeWhitespace } from "../../../../../utils/stringUtil"
import { useEditMode } from "../../../../context/EditModeContext"

export const WeaponSheet = ({ item }: { item: Item & { system: WeaponDataModel } }) => {
    return (
        <EquipmentSheetSubtypeBody>
            <div className="space-y-4">
                <div className="flex gap-x-4 justify-between">
                    <Grip item={item} />
                    <Range item={item} />
                    <DamageType item={item} />
                </div>
                <Damage item={item} />
                <ExplodingDiceItemConfig item={item} />
                <div className="flex justify-between items-center">
                    <Properties item={item} />
                    <Material item={item} />
                </div>
            </div>
        </EquipmentSheetSubtypeBody>
    )
}

const Range = ({ item }: { item: Item & { system: WeaponDataModel } }) => {
    return (
        <DropDown
            label={lang.ItemSheet.range}
            value={item.system.range}
            options={createDropdownEntries(lang.Ranges)}
            updateMechanism={{ updatePath: ['range'] }}
            parent={item}
        />
    )
}

const Grip = ({ item }: { item: Item & { system: WeaponDataModel } }) => {
    return (
        <DropDown
            label={lang.ItemSheet.grip}
            value={item.system.grip.style}
            options={createDropdownEntries(lang.Grips)}
            updateMechanism={{ updatePath: ['grip', 'style'] }}
            parent={item}
        />
    )
}

const Damage = ({ item }: { item: Item & { system: WeaponDataModel } }) => {
    const gripStyle = item.system.grip.style
    return (
        <div>
            <ItemSheetPropLabel label={lang.ItemSheet.damage} />
            <div className="flex gap-x-2 items-center text-text-secondary text-base font-paradigm">
                {
                    gripStyle === 'H' || gripStyle === 'V' || gripStyle === 'F' ?
                        <div className="flex gap-x-2">
                            <ItemSheetPropLabel label={lang.Grips.H} />
                            <div className="text-stat-block-fill text-xl font-eskapade font-bold">
                                <EditableTextField
                                    boundValue={item.system.damage.oneHand}
                                    updateProps={{ object: item, path: ['damage', 'oneHand'] }}
                                    placeholder="1d6"
                                />
                            </div>
                        </div> : <></>
                }
                {
                    gripStyle === 'V' ? <p className="text-2xl text-text-primary">|</p> : <></>
                }
                {
                    gripStyle === 'V' || gripStyle === 'HH' ?
                        <div className="flex gap-x-2">
                            <ItemSheetPropLabel label={lang.Grips.HH} />
                            <div className="text-stat-block-fill text-xl font-eskapade font-bold">
                                <EditableTextField
                                    boundValue={item.system.damage.twoHand}
                                    updateProps={{ object: item, path: ['damage', 'twoHand'] }}
                                    placeholder="1d10"
                                />
                            </div>
                        </div> : <></>
                }
            </div>
        </div>
    )
}

const DamageType = ({ item }: { item: Item & { system: WeaponDataModel } }) => {
    return (
        <DropDown
            label={lang.ItemSheet.damageType}
            value={item.system.damage.type}
            options={createDropdownEntries(lang.DamageTypes)}
            updateMechanism={{ updatePath: ['damage', 'type'] }}
            parent={item}
        />
    )
}

export const ExplodingDiceItemConfig = ({ item }: { item: Item & { system: WeaponDataModel } }) => {
    const { isEditMode } = useEditMode()
    const onCheckExplodable = useCallback((canExplode) => {
        item.update({ 'system.explodeData.canExplode': canExplode } as Record<string, boolean>)
    }, [item.system.explodeData.canExplode])

    const onUpdateExplodesOn = useCallback(async (explodesOn) => {
        await item.update({ 'system.explodeData.explodesOn': removeWhitespace(explodesOn).split(",") } as Record<string, string[]>)
        return explodesOn
    }, [item.system.explodeData.explodesOn])

    return (
        <>
            {
                isEditMode || item.system.explodeData.canExplode ?
                    <div className="flex gap-x-4 my-2">
                        <Checkbox
                            label={lang.ItemSheet.canExplode}
                            onCheckedChanged={onCheckExplodable}
                            checked={item.system.explodeData.canExplode}
                        />
                        {
                            item.system.explodeData.canExplode ?
                                <div className="flex gap-x-2 items-center">
                                    <ItemSheetPropLabel label={`${lang.ItemSheet.explodesOn}:`} />
                                    <ItemSheetPropValue value={
                                        <EditableTextField
                                            boundValue={item.system.explodeData.explodesOn.join(", ")}
                                            onSave={onUpdateExplodesOn}
                                            placeholder="7, 8"
                                        />
                                    } />
                                </div> : <></>
                        }
                    </div> : <></>
            }
        </>
    )
}

const Properties = ({ item }: { item: Item & { system: WeaponDataModel } }) => {
    return (
        <div>
            <div className="flex gap-x-1 items-center">
                <ItemSheetPropLabel label={lang.ItemSheet.props} />
                <OptionsSelectionMenu obj={item} label={''} path={['properties']} options={weaponProps(item)} />
            </div>
            <StringOptionsDisplay options={item.system.properties.map(it => lang.WeaponProps[it].name)} />
        </div>
    )
}

const weaponProps = (item: Item & { system: WeaponDataModel }) => {
    return Object.entries(lang.WeaponProps).map(prop => (
        { key: prop[0], value: prop[1].name, isSelected: item.system.properties.indexOf(prop[0]) > -1 }
    ))
}

const Material = ({ item }: { item: Item & { system: WeaponDataModel } }) => {
    return (
        <DropDown
            label={lang.ItemSheet.material}
            value={item.system.material}
            options={createDropdownEntriesFromObj(lang.Metals)}
            updateMechanism={{ updatePath: ['material'] }}
            parent={item}
        />
    )
}