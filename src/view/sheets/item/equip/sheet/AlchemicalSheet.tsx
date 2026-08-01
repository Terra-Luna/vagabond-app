import { AlchemicalItemDataModel } from "../../../../../model/item/equip/AlchemicalItemDataModel"
import { DropDown } from "../../../../component/Dropdown"
import { DamageType, ExplodingDiceItemConfig, ItemDamageTextField } from "../sheet/WeaponSheet"
import { createDropdownEntriesFromObj } from "../../../../../utils/localeUtils"
import { lang as fullLang } from "../../../../../utils/lang"
import { useEditMode } from "../../../../context/EditModeContext/Hooks"
import { ConsumableToggle } from "../component/ConsumableItemToggleComponent"
import { EquipmentSheetSubtypeBody } from "../component/EquipmentSheetSubtypeBody"
import { ItemSheetPropLabel } from "../component/ItemSheetLabelComponent"
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
                    {item.system.damage.type !== 'none' &&
                        <div className="flex gap-x-8 items-top">
                            <div>
                                <ItemSheetPropLabel
                                    label={`
                                        ${item.system.damage.type === 'healing'
                                            ? lang.DamageTypes.healing
                                            : (item.system.damage.type === 'mana'
                                                ? lang.DamageTypes.mana
                                                : lang.ItemSheet.damage
                                            )
                                        }
                                    `}
                                />
                                <ItemDamageTextField item={item} label={''} path={'oneHand'} />
                            </div>
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