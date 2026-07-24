import { useCallback } from "react"
import { AlchemicalItemDataModel } from "../../../../model/item/equip/AlchemicalItemDataModel"
import { ArmorDataModel } from "../../../../model/item/equip/ArmorDataModel"
import { ContainerDataModel } from "../../../../model/item/equip/ContainerDataModel"
import { EquipmentDataModel, EquipmentSchema } from "../../../../model/item/equip/EquipmentDataModel"
import { StarterPackDataModel } from "../../../../model/item/equip/StarterPackDataModel"
import { SundryDataModel } from "../../../../model/item/equip/SundryDataModel"
import { ToolDataModel } from "../../../../model/item/equip/ToolDataModel"
import { WeaponDataModel } from "../../../../model/item/equip/WeaponDataModel"
import { Checkbox } from "../../../component/Checkbox"
import { EditableTextField } from "../../../component/EditableTextField"
import { ItemDivider } from "../../../component/Header"
import { useEditMode } from "../../../context/EditModeContext/Hooks"
import { ArmorSheet } from "./sheet/ArmorSheet"
import { ContainerSheet } from "./sheet/ContainerSheet"
import { StarterPackSheet } from "./sheet/StarterPackSheet"
import { SundrySheet } from "./sheet/SundrySheet"
import { ToolSheet } from "./sheet/ToolSheet"
import { WeaponSheet } from "./sheet/WeaponSheet"
import { lang as fullLang, vgLiteLang } from "../../../../utils/lang"
import { CategorySelection } from "./component/ItemCategorySelectionComponent"
import { ItemSheetProperty, ItemSheetPropLabel } from "./component/ItemSheetLabelComponent"
import { ItemValue } from "./component/ItemValueComponent"
import { AlchemicalSheet } from "./sheet/AlchemicalSheet"
import { BaseItemSheetComponent } from "../shared/BaseItemSheetComponent"
import { EquipmentSheetBanner } from "./component/EquipmentSheetBanner"
import { Description } from "../../shared/Description"
import { useActiveEffectsManager } from "../../../../apps/active-effects/active-effect-handlers"
import { glowOnHover } from "../../../common/text-styles"
const lang = fullLang.VGLITE

export const EquipmentSheetComponent = ({ item, hideBottomSection = false }: {
    item: Item & { system: EquipmentDataModel<EquipmentSchema> },
    hideBottomSection?: boolean
}) => {

    const { setIsActiveEffectsOpen } = useActiveEffectsManager(item)

    let sheet: React.ReactElement

    if (item.system instanceof AlchemicalItemDataModel) {
        sheet = <AlchemicalSheet item={item as any} />
    }
    else if (item.system instanceof ArmorDataModel) {
        sheet = <ArmorSheet item={item as any} />
    }
    else if (item.system instanceof ContainerDataModel) {
        sheet = <ContainerSheet item={item as any} />
    }
    else if (item.system instanceof StarterPackDataModel) {
        sheet = <StarterPackSheet item={item as any} />
    }
    else if (item.system instanceof SundryDataModel) {
        sheet = <SundrySheet item={item as any} />
    }
    else if (item.system instanceof ToolDataModel) {
        sheet = <ToolSheet item={item as any} />
    }
    else if (item.system instanceof WeaponDataModel) {
        sheet = <WeaponSheet item={item as any} />
    }
    else {
        sheet = <></>
    }

    const sharedContent = !hideBottomSection &&
        <div className="flex flex-wrap justify-between gap-x-8 gap-y-6 w-full mt-1">
            <div className="space-y-2">
                <Bulk item={item} />
                <button title={vgLiteLang.ButtonActions.effects} onClick={() => setIsActiveEffectsOpen(true)} className={glowOnHover}>
                    <ItemSheetPropLabel label={vgLiteLang.ButtonActions.effects} />
                </button>
            </div>
            <div className="space-y-2">
                <ItemValue item={item} />
                <CategorySelection item={item} />
            </div>
        </div>

    return (
        <BaseItemSheetComponent
            banner={<EquipmentSheetBanner item={item} />}
            description={<Description item={item} />}
            body={<>
                {sheet}
                <ItemDivider />
                {sharedContent}
            </>}
            bodyClassName="text-text-primary bg-sheet-main-fill rounded-b-md px-4 w-full"
        />
    )
}

const Bulk = ({ item }) => {
    const { isEditMode } = useEditMode()

    const onCheckStackable = useCallback((isChecked) => {
        item.update({ 'system.bulk.isStackable': isChecked })
    }, [item.system.bulk?.isStackable])

    return (
        <div>
            <ItemSheetProperty label={lang.ItemSheet.slots} value={
                <EditableTextField
                    boundValue={item.system.bulk?.slots}
                    updateProps={{ object: item, path: ['bulk', 'slots'] }}
                    placeholder="0"
                />
            } />
            {
                isEditMode || item.system.bulk?.isStackable ?
                    <div>
                        <ItemSheetProperty label={lang.ItemSheet.stackable} value={
                            <Checkbox
                                label={''}
                                onCheckedChanged={onCheckStackable}
                                checked={item.system.bulk?.isStackable}
                            />
                        } />
                        <ItemSheetProperty label={lang.ItemSheet.qty} value={
                            <EditableTextField
                                boundValue={item.system.bulk?.quantity}
                                updateProps={{ object: item, path: ['bulk', 'quantity'] }}
                                placeholder="1"
                            />
                        } />
                    </div> : <></>
            }
            {
                item.system.bulk?.isStackable && item.system.bulk?.slots === 0 ?
                    <ItemSheetProperty label={lang.ItemSheet.stackSize} value={
                        <EditableTextField
                            boundValue={item.system.bulk?.stackSize}
                            updateProps={{ object: item, path: ['bulk', 'stackSize'] }}
                            placeholder="100"
                        />
                    } /> : <></>
            }
        </div>
    )
}