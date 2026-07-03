import { VGLITE as lang } from "../../../../../../public/lang/en.json"
import AlchemicalItemDataModel from "../../../../../model/item/equip/AlchemicalItemDataModel"
import { DropDown } from "../../../../component/Dropdown"
import { DamageType, ExplodingDiceItemConfig, ItemDamageTextField } from "./WeaponSheet"
import { createDropdownEntriesFromObj } from "../../../../../utils/localeUtils"
import { ConsumableToggle, EquipmentSheetSubtypeBody, ItemSheetPropLabel } from "../EquipmentSheetComponent"

export const AlchemicalSheet = ({ item }: { item: Item & { system: AlchemicalItemDataModel } }) => {
    return (
        <EquipmentSheetSubtypeBody>
            <div className="space-y-4">
                <div className="flex gap-x-8 justify-start items-start">
                    <DamageType item={item} />
                    {
                        item.system.damage.type === 'none' ? <></> :
                            <div>
                                <ItemSheetPropLabel
                                    label={`${item.system.damage.type === 'healing' ?
                                        lang.DamageTypes.healing :
                                        (item.system.damage.type === 'mana' ? lang.DamageTypes.mana :
                                            lang.ItemSheet.damage
                                        )
                                        }`}
                                />
                                <ItemDamageTextField item={item} label={''} path={'oneHand'} />
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