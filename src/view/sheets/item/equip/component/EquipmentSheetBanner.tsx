import type { EquipmentDataModel, EquipmentSchema } from "../../../../../model/item/equip/EquipmentDataModel"
import { appLang } from "../../../../../utils/lang"
import { EditableTextField } from "../../../../component/EditableTextField"
import { Divider } from "../../../../component/Header"
import { useEditMode } from "../../../../context/EditModeContext/Hooks"
import { ItemPortraitComponent } from "../../shared/ItemPortraitComponent"
import { RelicEffectList } from "./RelicEffectList"

export const EquipmentSheetBanner = ({ item }: { item: Item & { system: EquipmentDataModel<EquipmentSchema> } }) => {
    const { editModeToggleBtn } = useEditMode(item)

    const relicPowers = item.system.effectiveRelicPowers().filter(relic => relic.category.value !== 'cursed' || item.system.isBound)

    return (<>
        <div className="flex space-x-1 items-center bg-section-header-fill py-1 px-2 font-eskapade font-bold">
            <ItemPortraitComponent item={item} />
            <div className="flex flex-col w-full">
                <div className="flex gap-x-1 w-full items-center text-2xl text-text-section-header">
                <EditableTextField
                    boundValue={item.name}
                    updateProps={{ object: item, path: ['name'] }}
                    placeholder={"Item name..."}
                />
                    <Divider />
                    {editModeToggleBtn}
                </div>

                {item.system.isBoundRelic() && !item.system.isBound
                    ? <p className="text-xs font-paradigm font-normal italic text-text-header-secondary">{appLang.HeroSheet.Inventory.relicRequiresBinding}</p>
                    : <RelicEffectList relicPowers={relicPowers} />
                }
            </div>
        </div>
    </>)
}