
import { ActiveEffectsApp } from "../../../../apps/active-effects/ActiveEffectsApp"
import { AlchemicalItemDataModel } from "../../../../model/item/equip/AlchemicalItemDataModel"
import { ArmorDataModel } from "../../../../model/item/equip/ArmorDataModel"
import { ContainerDataModel } from "../../../../model/item/equip/ContainerDataModel"
import { EquipmentDataModel, EquipmentSchema } from "../../../../model/item/equip/EquipmentDataModel"
import { StarterPackDataModel } from "../../../../model/item/equip/StarterPackDataModel"
import { SundryDataModel } from "../../../../model/item/equip/SundryDataModel"
import { WeaponDataModel } from "../../../../model/item/equip/WeaponDataModel"
import { vgLiteLang } from "../../../../utils/lang"
import { ItemDivider } from "../../../component/Header"
import { useEditMode } from "../../../context/EditModeContext/Hooks"
import { Description } from "../../shared/Description"
import { BaseItemSheetComponent } from "../shared/BaseItemSheetComponent"
import { Bulk } from "./component/BulkConfig"
import { EquipmentSheetBanner } from "./component/EquipmentSheetBanner"
import { CategorySelection } from "./component/ItemCategorySelectionComponent"
import { ItemSheetPropLabel } from "./component/ItemSheetLabelComponent"
import { ItemValue } from "./component/ItemValueComponent"
import { RelicConfig } from "./component/RelicConfig"
import { AlchemicalSheet } from "./sheet/AlchemicalSheet"
import { ArmorSheet } from "./sheet/ArmorSheet"
import { ContainerSheet } from "./sheet/ContainerSheet"
import { StarterPackSheet } from "./sheet/StarterPackSheet"
import { SundrySheet } from "./sheet/SundrySheet"
import { WeaponSheet } from "./sheet/WeaponSheet"

export const EquipmentSheetComponent = ({ item, hideBottomSection = false }: {
    item: Item & { system: EquipmentDataModel<EquipmentSchema> },
    hideBottomSection?: boolean
}) => {
    const { isEditMode } = useEditMode()

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
    else if (item.system instanceof WeaponDataModel) {
        sheet = <WeaponSheet item={item as any} />
    }
    else {
        sheet = <></>
    }

    const sharedContent = !hideBottomSection &&
        <div className="flex flex-wrap justify-between gap-x-8 gap-y-6 w-full mt-1 mb-8">
            <div className="space-y-2">
                <Bulk item={item} />
                <div className="flex flex-col gap-y-2 items-start">
                    <button title={vgLiteLang.ButtonActions.effects} onClick={() => new ActiveEffectsApp(item).render({ force: true })} className={"hover-glow"}>
                        <ItemSheetPropLabel label={vgLiteLang.ButtonActions.effects} />
                    </button>
                </div>
            </div>
            <div className="space-y-2">
                <ItemValue item={item} />
                <CategorySelection item={item} />
            </div>
        </div>

    return (
        <BaseItemSheetComponent
            banner={<EquipmentSheetBanner item={item} />}
            description={<Description item={item} showFullView={true} />}
            body={<>
                {sheet}
                <ItemDivider />
                {sharedContent}
                {isEditMode && game.user?.isGM && (item.type as string) !== 'alchemical' &&
                    <RelicConfig item={item} />
                }
            </>}
            bodyClassName="text-text-primary bg-sheet-main-fill rounded-b-md px-4 w-full"
        />
    )
}