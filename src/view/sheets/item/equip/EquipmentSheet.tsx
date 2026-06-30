import { useState } from "react";
import ArmorDataModel from "../../../../model/item/equip/ArmorDataModel";
import EquipmentDataModel, { EquipmentSchema } from "../../../../model/item/equip/EquipmentDataModel";
import { Divider } from "../../../component/Header";
import { FoundryItem, VgLiteItemSheet } from "../VgLiteItemSheet";
import WeaponDataModel from "../../../../model/item/equip/WeaponDataModel";
import { WeaponSheet } from "./type/WeaponSheet";
import { LockKeyhole, LockKeyholeOpen } from "lucide-react";
import { ArmorSheet } from "./type/ArmorSheet";
import SundryDataModel from "../../../../model/item/equip/SundryDataModel";
import { SundrySheet } from "./type/SundrySheet";

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
    return (
        <BaseEquipmentSheetHost
            header={<EquipmentSheetHeader
                img={item.img}
                name={item.name}
                isEditMode={isEditMode}
                setIsEditMode={setIsEditMode}
            />}
            children={<>
                if (item instanceof ArmorDataModel) {
                    <ArmorSheet item={item as FoundryItem<ArmorDataModel>} isEditMode={isEditMode} />
                }

                else if (item instanceof WeaponDataModel) {
                    <WeaponSheet item={item as FoundryItem<WeaponDataModel>} isEditMode={isEditMode} />
                }
                else {
                    <SundrySheet item={item as FoundryItem<SundryDataModel>} isEditMode={isEditMode} />
                }
            </>}
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
                <div className="text-xl mr-1">{name}</div>
                <Divider />
                <div onClick={() => setIsEditMode(!isEditMode)}>
                    isEditMode ? <LockKeyholeOpen size={18} /> : <LockKeyhole size={18} />
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