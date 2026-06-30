import { useState } from "react";
import ArmorDataModel, { ArmorSchema } from "../../../../model/item/equip/ArmorDataModel";
import EquipmentDataModel, { EquipmentSchema } from "../../../../model/item/equip/EquipmentDataModel";
import { Divider } from "../../../component/Header";
import { FoundryItem, VgLiteItemSheet } from "../VgLiteItemSheet";
import WeaponDataModel from "../../../../model/item/equip/WeaponDataModel";
import { WeaponSheet } from "./type/WeaponSheet";
import { LockKeyhole, LockKeyholeOpen } from "lucide-react";
import { ArmorSheet } from "./type/ArmorSheet";
import SundryDataModel from "../../../../model/item/equip/SundryDataModel";
import { SundrySheet } from "./type/SundrySheet";
import { ToolSheet } from "./type/ToolSheet";
import ToolDataModel from "../../../../model/item/equip/ToolDataModel";
import AlchemicalItemDataModel from "../../../../model/item/equip/AlchemicalDataModel";
import { AlchemicalSheet } from "./type/AlchemicalSheet";
import StarterPackDataModel from "../../../../model/item/equip/StarterPackDataModel";
import { StarterPackSheet } from "./type/StarterPackSheet";
import ContainerDataModel from "../../../../model/item/equip/ContainerDataModel";
import { ContainerSheet } from "./type/ContainerSheet";

export class EquipmentSheet extends VgLiteItemSheet {
    Component = EquipmentSheetReactComponent
    static DEFAULT_OPTIONS = {
        position: {
            width: 400,
            height: 700
        },
        window: {
            resizable: true
        }
    }
}

const EquipmentSheetReactComponent = ({ item }: { item: FoundryItem<EquipmentDataModel<EquipmentSchema>> }) => {
    const [isEditMode, setIsEditMode] = useState(false)
    let sheet: React.ReactElement
    if (item.system instanceof AlchemicalItemDataModel) {
        sheet = <AlchemicalSheet item={item as any} isEditMode={isEditMode} />
    }
    else if (item.system instanceof ArmorDataModel) {
        sheet = <ArmorSheet item={item as any} isEditMode={isEditMode} />
    }
    else if (item.system instanceof ContainerDataModel) {
        sheet = <ContainerSheet item={item as any} isEditMode={isEditMode} />
    }
    else if (item.system instanceof StarterPackDataModel) {
        sheet = <StarterPackSheet item={item as any} isEditMode={isEditMode} />
    }
    else if (item.system instanceof SundryDataModel) {
        sheet = <SundrySheet item={item as any} isEditMode={isEditMode} />
    }
    else if (item.system instanceof ToolDataModel) {
        sheet = <ToolSheet item={item as any} isEditMode={isEditMode} />
    }
    else if (item.system instanceof WeaponDataModel) {
        sheet = <WeaponSheet item={item as any} isEditMode={isEditMode} />
    }
    else {
        sheet = <></>
    }

    return (
        <BaseEquipmentSheetHost
            header={<EquipmentSheetHeader
                img={item.img}
                name={item.name}
                isEditMode={isEditMode}
                setIsEditMode={setIsEditMode}
            />}
            children={sheet}
        />
    )
}

export const EquipmentSheetHeader = ({ img, name, isEditMode, setIsEditMode }: {
    img: string, name: string, isEditMode: boolean, setIsEditMode: any
}) => {
    return (
        <div className={`flex space-x-1 items-center bg-section-header-fill px-1 font-eskapade font-bold`}>
            {img == null ? <></> :
                <img className={`object-contain h-[54px] w-[54px] p-0.5`} src={img} alt={''} />
            }
            <div className="flex w-full items-center text-text-section-header">
                <div className="text-2xl mr-1">{name}</div>
                <Divider />
                <div onClick={() => setIsEditMode(!isEditMode)}>
                    {isEditMode ? <LockKeyholeOpen size={18} /> : <LockKeyhole size={18} />}
                </div>
            </div>
        </div>
    )
}

export const EquipmentSheetBody = ({ children }: { children: React.ReactElement }) => {
    return (
        <div className="p-2">{children}</div>
    )
}

export const BaseEquipmentSheetHost = ({ header, children }: { header: React.ReactElement, children: React.ReactElement }) => {
    return (
        <div className="bg-sheet-main-fill">
            {header}
            {children}
        </div>
    )
}