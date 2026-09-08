import { SundryDataModel } from "../../../../../model/item/equip/SundryDataModel"
import { appLang } from "../../../../../utils/lang"
import { EquipmentSheetSubtypeBody } from "../component/EquipmentSheetSubtypeBody"
import { ItemToggleOption } from "../component/ItemToggleOption"

export const SundrySheet = ({ item }: { item: Item & { system: SundryDataModel } }) => {
    return (
        <EquipmentSheetSubtypeBody>
            <div>
                <ItemToggleOption item={item} label={appLang.ItemSheet.equippable} path={"system.isEquippable"} />
                <ItemToggleOption item={item} label={appLang.ItemSheet.consumable} path={"system.isConsumable"} />
                <ItemToggleOption item={item} label={appLang.ItemSheet.isRation} path={"system.isRation"} />

                {/* One-time configs for specific items... */}
                {/* <ItemToggleOption item={item} label={appLang.ItemSheet.materials} path={"system.isMaterials"} />
                <ItemToggleOption item={item} label={appLang.ItemSheet.alchtools} path={"system.isAlchemyTools"} /> */}
            </div>
        </EquipmentSheetSubtypeBody>
    )
}