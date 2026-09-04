import { useCallback } from "react"

import { DiceRoll } from "../../../../../combat/engine/roll/DiceRoll"
import { DiceRollInputComponent } from "../../../../../combat/ui/DiceRollInputComponent"
import { WeaponDataModel } from "../../../../../model/item/equip/WeaponDataModel"
import { appLang } from "../../../../../utils/lang"
import { createDropdownEntries } from "../../../../../utils/localeUtils"
import { CustomDropDown } from "../../../../component/Dropdown"
import { OptionsSelectionMenu, StringOptionsDisplay } from "../../../../component/OptionsSelectionMenu"
import { DamageTypeSelector } from "../../shared/DamageTypeSelector"
import { EquipmentSheetSubtypeBody } from "../component/EquipmentSheetSubtypeBody"
import { ItemSheetPropLabel } from "../component/ItemSheetLabelComponent"
import { MaterialSelection } from "../component/MaterialSelectionComponent"

export const WeaponSheet = ({ item }: { item: Item & { system: WeaponDataModel } }) => {

    const damageDice = item.system.damage.dice as DiceRoll

    const handleDiceChange = useCallback((updatedDice: Partial<DiceRoll>) => {
        const newDice = { ...damageDice, ...updatedDice }
        item.update({ 'system.damage.dice': newDice } as Record<string, any>)
    }, [item, damageDice])

    return (
        <EquipmentSheetSubtypeBody>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 items-start">
                <WeaponSkills item={item} />
                <Properties item={item} />
                <Range item={item} />
                <Grip item={item} />
                <DiceRollInputComponent label={appLang.ItemSheet.damage} diceRoll={damageDice} onChange={handleDiceChange} wrap={true} />
                <DamageTypeSelector item={item} path={'system.damage.type'} />
                <MaterialSelection item={item} />
            </div>
        </EquipmentSheetSubtypeBody>
    )
}

const Grip = ({ item }: { item: Item & { system: WeaponDataModel } }) => {
    return (
        <div>
            <ItemSheetPropLabel label={appLang.ItemSheet.grip} />
            <div className="flex gap-x-1 items-start">
            <CustomDropDown
                value={item.system.grip.style}
                    options={createDropdownEntries(appLang.Grips)}
                onChange={(e) => item.update({ 'system.grip.style': e.target.value } as Record<string, string>)}
            />
            </div>
        </div>
    )
}

const Range = ({ item }: { item: Item & { system: WeaponDataModel } }) => {
    return (
        <div>
            <ItemSheetPropLabel label={appLang.ItemSheet.range} />
            <div className="flex gap-x-1 items-start">
                <CustomDropDown
                    value={item.system.range}
                    options={createDropdownEntries(appLang.Ranges)}
                    onChange={(e) => item.update({ 'system.range': e.target.value } as Record<string, string>)}
                />
            </div>
        </div>
    )
}

const WeaponSkills = ({ item }: { item: Item & { system: WeaponDataModel } }) => {
    return (
        <div>
            <div className="flex items-center">
                <ItemSheetPropLabel label={appLang.ItemSheet.type} />
                <OptionsSelectionMenu obj={item} label={''} path={['skills']} options={weaponSkillOptions(item)} />
            </div>
            <div className="flex gap-x-1 items-start">
                <StringOptionsDisplay options={item.system.skills.map(it => appLang.WeaponSkills[it].name)} />
            </div>
        </div>
    )
}

const Properties = ({ item }: { item: Item & { system: WeaponDataModel } }) => {
    return (
        <div>
            <div className="flex items-center">
                <ItemSheetPropLabel label={appLang.ItemSheet.props} />
                <OptionsSelectionMenu obj={item} label={''} path={['properties']} options={weaponProps(item)} />
            </div>
            <div className="flex gap-x-1 items-start">
                <div className="flex flex-wrap gap-x-1 text-text-secondary font-paradigm font-normal italic">
                    {item.system.properties.map((it, index) => (
                        <p key={index} title={appLang.WeaponProps[it].description}>
                            {`${appLang.WeaponProps[it].name}${index > item.system.properties.length - 2 ? '' : ','}`}
                        </p>
                    ))}
                </div>
            </div>
        </div>
    )
}

const weaponSkillOptions = (item: Item & { system: WeaponDataModel }) => {
    return Object.entries(appLang.WeaponSkills).map(type => (
        { key: type[0], value: type[1].name, isSelected: item.system.skills.indexOf(type[0]) > -1 }
    ))
}

const weaponProps = (item: Item & { system: WeaponDataModel }) => {
    return Object.entries(appLang.WeaponProps).map(prop => (
        { key: prop[0], value: prop[1].name, isSelected: item.system.properties.indexOf(prop[0]) > -1 }
    ))
}