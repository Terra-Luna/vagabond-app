import { AlchemicalItemDataModel } from "../../../../../model/item/equip/AlchemicalItemDataModel"
import { DropDown } from "../../../../component/Dropdown"
import { ExplodingDiceItemConfig } from "../sheet/WeaponSheet"
import { createDropdownEntriesFromObj } from "../../../../../utils/localeUtils"
import { lang as fullLang } from "../../../../../utils/lang"
import { ConsumableToggle } from "../component/ConsumableItemToggleComponent"
import { EquipmentSheetSubtypeBody } from "../component/EquipmentSheetSubtypeBody"
import { DamageTypeSelector } from "../../shared/DamageTypeSelector"
const lang = fullLang.VGLITE

export const AlchemicalSheet = ({ item }: { item: Item & { system: AlchemicalItemDataModel } }) => {
    return (
        <EquipmentSheetSubtypeBody>
            <div className="space-y-4">
                <div className="flex gap-x-8 justify-start items-start">
                    <DamageTypeSelector item={item} path={'system.damage.type'} />
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