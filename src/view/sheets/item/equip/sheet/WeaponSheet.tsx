import { WeaponDataModel } from "../../../../../model/item/equip/WeaponDataModel"
import { CustomDropDown } from "../../../../component/Dropdown"
import { createDropdownEntries } from "../../../../../utils/localeUtils"
import { OptionsSelectionMenu, StringOptionsDisplay } from "../../../../component/OptionsSelectionMenu"
import { MaterialSelection } from "../component/MaterialSelectionComponent"
import { ItemSheetPropLabel } from "../component/ItemSheetLabelComponent"
import { DamageTypeSelector } from "../../shared/DamageTypeSelector"
import { DiceInputComponent } from "../../../../../combat/ui/DiceInputComponent"
import { DiceRoll } from "../../../../../combat/engine/DiceRoll"
import { vgLiteLang } from "../../../../../utils/lang"
import { EquipmentSheetSubtypeBody } from "../component/EquipmentSheetSubtypeBody"
import { useCallback } from "react"

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
                <DiceInputComponent label={vgLiteLang.ItemSheet.damage} diceRoll={damageDice} onChange={handleDiceChange} />
                <DamageTypeSelector item={item} path={'system.damage.type'} />
                <MaterialSelection item={item} />
            </div>
        </EquipmentSheetSubtypeBody>
    )
}

const Grip = ({ item }: { item: Item & { system: WeaponDataModel } }) => {
    return (
        <div>
            <ItemSheetPropLabel label={vgLiteLang.ItemSheet.grip} />
            <div className="flex gap-x-1 items-start">
            <CustomDropDown
                value={item.system.grip.style}
                    options={createDropdownEntries(vgLiteLang.Grips)}
                onChange={(e) => item.update({ 'system.grip.style': e.target.value } as Record<string, string>)}
            />
            </div>
        </div>
    )
}

const Range = ({ item }: { item: Item & { system: WeaponDataModel } }) => {
    return (
        <div>
            <ItemSheetPropLabel label={vgLiteLang.ItemSheet.range} />
            <div className="flex gap-x-1 items-start">
                <CustomDropDown
                    value={item.system.range}
                    options={createDropdownEntries(vgLiteLang.Ranges)}
                    onChange={(e) => item.update({ 'system.range': e.target.value } as Record<string, string>)}
                />
            </div>
        </div>
    )
}

const WeaponSkills = ({ item }: { item: Item & { system: WeaponDataModel } }) => {
    return (
        <div>
            <ItemSheetPropLabel label={vgLiteLang.ItemSheet.type} />
            <div className="flex gap-x-1 items-start">
                <OptionsSelectionMenu obj={item} label={''} path={['skills']} options={weaponSkillOptions(item)} />
                <StringOptionsDisplay options={item.system.skills.map(it => vgLiteLang.WeaponSkills[it].name)} />
            </div>
        </div>
    )
}

const Properties = ({ item }: { item: Item & { system: WeaponDataModel } }) => {
    return (
        <div>
            <ItemSheetPropLabel label={vgLiteLang.ItemSheet.props} />
            <div className="flex gap-x-1 items-start">
                <OptionsSelectionMenu obj={item} label={''} path={['properties']} options={weaponProps(item)} />
                <div className="flex flex-wrap gap-x-1 text-text-secondary font-paradigm font-normal italic">
                    {item.system.properties.map((it, index) => (
                        <p key={index} title={vgLiteLang.WeaponProps[it].description}>
                            {`${vgLiteLang.WeaponProps[it].name}${index > item.system.properties.length - 2 ? '' : ','}`}
                        </p>
                    ))}
                </div>
            </div>
        </div>
    )
}

const weaponSkillOptions = (item: Item & { system: WeaponDataModel }) => {
    return Object.entries(vgLiteLang.WeaponSkills).map(type => (
        { key: type[0], value: type[1].name, isSelected: item.system.skills.indexOf(type[0]) > -1 }
    ))
}

const weaponProps = (item: Item & { system: WeaponDataModel }) => {
    return Object.entries(vgLiteLang.WeaponProps).map(prop => (
        { key: prop[0], value: prop[1].name, isSelected: item.system.properties.indexOf(prop[0]) > -1 }
    ))
}