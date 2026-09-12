import { SundryDataModel } from "../../../../../model/item/equip/SundryDataModel"
import { appLang } from "../../../../../utils/lang"
import { useEditMode } from "../../../../context/EditModeContext/Hooks"
import { EquipmentSheetSubtypeBody } from "../component/EquipmentSheetSubtypeBody"
import { ItemToggleOption } from "../component/ItemToggleOption"

export const SundrySheet = ({ item }: { item: Item & { system: SundryDataModel } }) => {
    const { isEditMode } = useEditMode()

    return (
        <EquipmentSheetSubtypeBody>
            <div>
                {isEditMode && <ItemToggleOption item={item} label={appLang.ItemSheet.equippable} path={"system.isEquippable"} />}
                {isEditMode && item.system.isEquippable &&
                    <ItemToggleOption item={item} label={appLang.ItemSheet.wearable} path={"system.isWearable"} />
                }
                {isEditMode && <ItemToggleOption item={item} label={appLang.ItemSheet.consumable} path={"system.isConsumable"} />}
                {isEditMode && <ItemToggleOption item={item} label={appLang.ItemSheet.isRation} path={"system.isRation"} />}

                {/* One-time configs for specific items... */}
                {/* <ItemToggleOption item={item} label={appLang.ItemSheet.materials} path={"system.isMaterials"} />
                <ItemToggleOption item={item} label={appLang.ItemSheet.alchtools} path={"system.isAlchemyTools"} /> */}
            </div>
        </EquipmentSheetSubtypeBody>
    )
}