import { ActiveEffectsView } from "../../../../apps/active-effects/ActiveEffectsView"
import { EquipmentDataModel, EquipmentSchema } from "../../../../model/item/equip/EquipmentDataModel"
import { ItemRulesManager } from "../../../../rules/ItemRulesManager"
import { Divider } from "../../../component/Header"
import { useEditMode } from "../../../context/EditModeContext/Hooks"
import { Description } from "../../shared/Description"
import { BaseItemSheetComponent } from "../shared/BaseItemSheetComponent"
import { Bulk } from "./component/BulkConfig"
import { EquipmentSheetBanner } from "./component/EquipmentSheetBanner"
import { CategorySelection } from "./component/ItemCategorySelectionComponent"
import { ItemValue } from "./component/ItemValueComponent"
import { RelicConfig } from "./component/RelicConfig"
import { AlchemicalSheet } from "./sheet/AlchemicalSheet"
import { ArmorSheet } from "./sheet/ArmorSheet"
import { ContainerSheet } from "./sheet/ContainerSheet"
import { StartingPackSheet } from "./sheet/StartingPackSheet"
import { SundrySheet } from "./sheet/SundrySheet"
import { WeaponSheet } from "./sheet/WeaponSheet"

export const EquipmentSheetComponent = ({ item, hideBottomSection = false }: {
    item: Item & { system: EquipmentDataModel<EquipmentSchema> },
    hideBottomSection?: boolean
}) => {
    const { isEditMode } = useEditMode()

    let sheet: React.ReactElement

    if ((item.type as string) === "alchemical") {
        sheet = <AlchemicalSheet key={item.uuid} item={item as any} />
    }
    else if ((item.type as string) === "armor") {
        sheet = <ArmorSheet key={item.uuid} item={item as any} />
    }
    else if ((item.type as string) === "container") {
        sheet = <ContainerSheet key={item.uuid} item={item as any} />
    }
    else if ((item.type as string) === "startingpack") {
        sheet = <StartingPackSheet key={item.uuid} item={item as any} />
    }
    else if ((item.type as string) === "sundry") {
        sheet = <SundrySheet key={item.uuid} item={item as any} />
    }
    else if ((item.type as string) === "weapon") {
        sheet = <WeaponSheet key={item.uuid} item={item as any} />
    }
    else {
        sheet = <></>
    }

    const sharedContent = !hideBottomSection &&
        <div className="flex flex-wrap justify-between gap-x-8 gap-y-6 w-full mt-1 mb-2">
            <div className="flex flex-col gap-2">
                <Bulk item={item} />
            </div>
            <div className="space-y-2">
                <ItemValue item={item} />
                <CategorySelection item={item} />
            </div>
            <div className="flex flex-col gap-1 w-full -mt-4">
                <Divider />
                <ActiveEffectsView initialDocument={item} />
            </div>
        </div>

    return (
        <BaseItemSheetComponent
            banner={<EquipmentSheetBanner item={item} />}
            description={<>{(item.type as string) !== 'startingpack' && <Description item={item} showFullView={true} italic={false} />}</>}
            bodyClassName="text-text-primary bg-sheet-main-fill rounded-b-md px-4 w-full"
            body={<>
                {sheet}
                {sharedContent}
                {isEditMode
                    && game.user?.isActiveGM
                    && (item.type as string) !== 'alchemical'
                    && (item.type as string) !== 'startingpack'
                    && <div className="flex flex-col mb-4">
                        <RelicConfig item={item} />
                        <ItemRulesManager item={item} />
                    </div>
                }
            </>}
        />
    )
}