import { VGLITE as lang } from "../../../../../../public/lang/en.json"
import WeaponDataModel from "../../../../../model/item/equip/WeaponDataModel"
import { EquipmentSheetSubtypeBody, ItemSheetPropLabel } from "../EquipmentSheet"
import { DropDown } from "../../../../component/Dropdown"
import { createDropdownEntries } from "../../../../../utils/localeUtils"
import { OptionsSelectionMenu, StringOptionsDisplay } from "../../../../component/OptionsSelectionMenu"
import { EditableTextField } from "../../../../component/EditableTextField"

export const WeaponSheet = ({ item, isEditMode }: { 
    item: Item & { system: WeaponDataModel }, isEditMode: boolean
}) => {
    return (
        <EquipmentSheetSubtypeBody><>
            <div className="flex justify-between">
                <Range item={item} isEditMode={isEditMode} />
                <Grip item={item} isEditMode={isEditMode} />
                <Damage item={item} isEditMode={isEditMode} />
                <DamageType item={item} isEditMode={isEditMode} />
            </div>
            <div className="flex justify-between">
                <Properties item={item} isEditMode={isEditMode} />
            </div>
        </></EquipmentSheetSubtypeBody>
    )
}

const Range = ({ item, isEditMode }: {
    item: Item & { system: WeaponDataModel }, isEditMode: boolean
}) => {
    return (
        <DropDown
            label={lang.ItemSheet.range}
            value={item.system.range}
            options={createDropdownEntries(lang.Ranges)}
            updateMechanism={{ updatePath: ['range'] }}
            parent={item}
            isGlobalEditMode={isEditMode}
        />
    )
}

const Grip = ({ item, isEditMode }: {
    item: Item & { system: WeaponDataModel }, isEditMode: boolean
}) => {
    return (
        <DropDown
            label={lang.ItemSheet.grip}
            value={item.system.grip.style}
            options={createDropdownEntries(lang.Grips)}
            updateMechanism={{ updatePath: ['grip', 'style'] }}
            parent={item}
            isGlobalEditMode={isEditMode}
        />
    )
}

const Properties = ({ item, isEditMode }: {
    item: Item & { system: WeaponDataModel }, isEditMode: boolean
}) => {
    return (
        <div>
            <div className="flex gap-x-1">
                <ItemSheetPropLabel label={lang.ItemSheet.props} />
                <OptionsSelectionMenu obj={item} label={''} path={['properties']} options={weaponProps(item)} isGlobalEditMode={isEditMode} />
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

const Damage = ({ item, isEditMode }: {
    item: Item & { system: WeaponDataModel }, isEditMode: boolean
}) => {
    const gripStyle = item.system.grip.style
    return (
        <div className="flex-col">
            <ItemSheetPropLabel label={lang.ItemSheet.damage} />
            <div className="flex-col text-text-secondary text-base font-paradigm">
                {
                    gripStyle === 'H' || gripStyle === 'V' || gripStyle === 'F' ?
                        <div className="flex gap-x-2">
                            <ItemSheetPropLabel label={lang.Grips.H} />
                            <div className="text-stat-block-fill text-xl font-eskapade font-bold">
                                <EditableTextField
                                    boundValue={item.system.damage.oneHand}
                                    updateProps={{ object: item, path: ['damage', 'oneHand'] }}
                                    placeholder="1d6"
                                    isGlobalEditMode={isEditMode}
                                />
                            </div>
                        </div> : <></>
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
                                    isGlobalEditMode={isEditMode}
                                />
                            </div>
                        </div> : <></>
                }
            </div>
        </div>
    )
}

const DamageType = ({ item, isEditMode }: {
    item: Item & { system: WeaponDataModel }, isEditMode: boolean
}) => {
    return (
        <DropDown
            label={lang.ItemSheet.damageType}
            value={item.system.damage.type}
            options={createDropdownEntries(lang.DamageTypes)}
            updateMechanism={{ updatePath: ['damage', 'type'] }}
            parent={item}
            isGlobalEditMode={isEditMode}
        />
    )
}