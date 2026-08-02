import { WeaponDataModel } from "../../../../../model/item/equip/WeaponDataModel"
import { CustomDropDown } from "../../../../component/Dropdown"
import { createDropdownEntries } from "../../../../../utils/localeUtils"
import { OptionsSelectionMenu, StringOptionsDisplay } from "../../../../component/OptionsSelectionMenu"
import { EditableTextField, NumericCounterInput } from "../../../../component/EditableTextField"
import { Checkbox } from "../../../../component/Checkbox"
import { useCallback } from "react"
import { removeWhitespace } from "../../../../../utils/stringUtil"
import { useEditMode } from "../../../../context/EditModeContext/Hooks"
import { AlchemicalItemDataModel } from "../../../../../model/item/equip/AlchemicalItemDataModel"
import { lang as fullLang } from "../../../../../utils/lang"
import { Material } from "../component/MaterialSelectionComponent"
import { ItemSheetPropLabel, ItemSheetPropValue } from "../component/ItemSheetLabelComponent"
import { EquipmentSheetSubtypeBody } from "../component/EquipmentSheetSubtypeBody"
import { DamageTypeSelector } from "../../shared/DamageTypeSelector"

const lang = fullLang.VGLITE

export const WeaponSheet = ({ item }: { item: Item & { system: WeaponDataModel } }) => {
    return (
        <EquipmentSheetSubtypeBody>
            <div className="space-y-4">
                <div className="flex gap-x-4 justify-between">
                    <WeaponTypes item={item} />
                    <Properties item={item} />
                    <Range item={item} />
                </div>

                <div className="flex gap-x-4 justify-between">
                    <Grip item={item} />
                    <Damage item={item} />
                    <DamageMod item={item} />
                    <DamageTypeSelector item={item} path={'system.damage.type'} />
                </div>

                <ExplodingDiceItemConfig item={item} />
                <Material item={item} />
            </div>
        </EquipmentSheetSubtypeBody>
    )
}

const Grip = ({ item }: { item: Item & { system: WeaponDataModel } }) => {
    return (
        <div className="items-start">
            <ItemSheetPropLabel label={lang.ItemSheet.grip} />
            <CustomDropDown
                value={item.system.grip.style}
                options={createDropdownEntries(lang.Grips)}
                onChange={(e) => item.update({ 'system.grip.style': e.target.value } as Record<string, string>)}
            />
        </div>
    )
}

const Damage = ({ item }: { item: Item & { system: WeaponDataModel } }) => {
    return (
        <div className="items-start">
            <ItemSheetPropLabel label={lang.ItemSheet.damage} />
            <CustomDropDown
                value={item.system.damage.dieSize.toString()}
                options={[
                    { value: "1", label: "1" },
                    { value: "4", label: "d4" },
                    { value: "6", label: "d6" },
                    { value: "8", label: "d8" },
                    { value: "10", label: "d10" },
                    { value: "12", label: "d12" },
                    { value: "20", label: "d20" },
                ]}
                onChange={(e) => item.update({ 'system.damage.dieSize': Number(e.target.value) || 1 } as Record<string, number>)}
            />
        </div>
    )
}

const DamageMod = ({ item }: { item: Item & { system: WeaponDataModel } }) => {
    return (
        <div className="items-start">
            <ItemSheetPropLabel label={lang.ItemSheet.damageMod} />
            <NumericCounterInput
                value={item.system.damage.modifier ?? 0}
                onChange={(val) => item.update({ 'system.damage.modifier': val } as Record<string, number>)}
            />
        </div>
    )
}

const Range = ({ item }: { item: Item & { system: WeaponDataModel } }) => {
    return (
        <div className="items-start">
            <ItemSheetPropLabel label={lang.ItemSheet.range} />
            <CustomDropDown
                value={item.system.range}
                options={createDropdownEntries(lang.Ranges)}
                onChange={(e) => item.update({ 'system.range': e.target.value } as Record<string, string>)}
            />
        </div>
    )
}

export const ExplodingDiceItemConfig = ({ item }: { item: Item & { system: WeaponDataModel | AlchemicalItemDataModel } }) => {
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
                isEditMode || item.system.explodeData.canExplode &&
                    <div className="flex gap-x-4 my-2">
                        {
                            isEditMode &&
                                <Checkbox
                                    label={lang.ItemSheet.canExplode}
                                    onCheckedChanged={onCheckExplodable}
                                    checked={item.system.explodeData.canExplode}
                            />
                        }
                        {
                            item.system.explodeData.canExplode &&
                                <div className="flex gap-x-2 items-center">
                                    <ItemSheetPropLabel label={`${lang.ItemSheet.explodesOn}:`} />
                                    <ItemSheetPropValue value={
                                        <EditableTextField
                                            boundValue={item.system.explodeData.explodesOn.join(", ")}
                                            onSave={onUpdateExplodesOn}
                                            placeholder="7, 8"
                                        />
                                    } />
                                </div>
                        }
                    </div>
            }
        </>
    )
}

const WeaponTypes = ({ item }: { item: Item & { system: WeaponDataModel } }) => {
    return (
        <div>
            <div className="flex items-center">
                <ItemSheetPropLabel label={lang.ItemSheet.type} />
                <OptionsSelectionMenu obj={item} label={''} path={['weaponTypes']} options={weaponTypes(item)} />
            </div>
            <StringOptionsDisplay options={item.system.weaponTypes.map(it => lang.WeaponTypes[it].name)} />
        </div>
    )
}

const Properties = ({ item }: { item: Item & { system: WeaponDataModel } }) => {
    return (
        <div>
            <div className="flex items-center">
                <ItemSheetPropLabel label={lang.ItemSheet.props} />
                <OptionsSelectionMenu obj={item} label={''} path={['properties']} options={weaponProps(item)} />
            </div>
            <div className="flex flex-wrap gap-x-1 text-text-secondary font-paradigm font-normal italic">
                {item.system.properties.map((it, index) => (
                    <p key={index} title={lang.WeaponProps[it].description}>
                        {`${lang.WeaponProps[it].name}${index > item.system.properties.length - 2 ? '' : ','}`}
                    </p>
                ))}
            </div>
        </div>
    )
}

const weaponTypes = (item: Item & { system: WeaponDataModel }) => {
    return Object.entries(lang.WeaponTypes).map(type => (
        { key: type[0], value: type[1].name, isSelected: item.system.weaponTypes.indexOf(type[0]) > -1 }
    ))
}

const weaponProps = (item: Item & { system: WeaponDataModel }) => {
    return Object.entries(lang.WeaponProps).map(prop => (
        { key: prop[0], value: prop[1].name, isSelected: item.system.properties.indexOf(prop[0]) > -1 }
    ))
}