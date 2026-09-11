import { RelicPowers } from "../../../../../apps/vagabond-tools/relic/RelicPowers"
import { EquipmentDataModel, EquipmentSchema } from "../../../../../model/item/equip/EquipmentDataModel"
import { EditableTextField } from "../../../../component/EditableTextField"
import { Divider } from "../../../../component/Header"
import { useEditMode } from "../../../../context/EditModeContext/Hooks"
import { ItemPortraitComponent } from "../../shared/ItemPortraitComponent"

export const EquipmentSheetBanner = ({ item }: { item: Item & { system: EquipmentDataModel<EquipmentSchema> } }) => {
    const { editModeToggleBtn } = useEditMode(item)

    const relicPowers = item.system.relicPowers?.filter(relic => relic.category.value !== 'cursed')

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

                {relicPowers && relicPowers.length > 0 && (
                    <div className="flex flex-wrap gap-x-1">
                        {relicPowers.map((relic: any, index: number) => (
                            <p
                                key={relic.id || index}
                                title={relic.description}
                                className="text-xs text-text-header-secondary font-paradigm font-normal italic"
                            >
                                {RelicPowers.getFormattedRelicName(relic)}
                                {index < relicPowers.length - 1 && ","}
                            </p>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </>)
}