import { VGLITE as lang } from "../../../../../public/lang/en.json"
import { useCallback, useState } from "react"
import ArmorDataModel from "../../../../model/item/equip/ArmorDataModel"
import EquipmentDataModel, { EquipmentSchema } from "../../../../model/item/equip/EquipmentDataModel"
import { Divider, ItemDivider } from "../../../component/Header"
import { FoundryItem, VgLiteItemSheet } from "../VgLiteItemSheet"
import WeaponDataModel from "../../../../model/item/equip/WeaponDataModel"
import { WeaponSheet } from "./type/WeaponSheet"
import { LockKeyhole, LockKeyholeOpen, MessageSquareText, Pencil } from "lucide-react"
import { ArmorSheet } from "./type/ArmorSheet"
import SundryDataModel from "../../../../model/item/equip/SundryDataModel"
import { SundrySheet } from "./type/SundrySheet"
import { ToolSheet } from "./type/ToolSheet"
import ToolDataModel from "../../../../model/item/equip/ToolDataModel"
import AlchemicalItemDataModel from "../../../../model/item/equip/AlchemicalDataModel"
import { AlchemicalSheet } from "./type/AlchemicalSheet"
import StarterPackDataModel from "../../../../model/item/equip/StarterPackDataModel"
import { StarterPackSheet } from "./type/StarterPackSheet"
import ContainerDataModel from "../../../../model/item/equip/ContainerDataModel"
import { ContainerSheet } from "./type/ContainerSheet"
import { EditableTextField } from "../../../component/EditableTextField"
import { DropDown } from "../../../component/Dropdown"
import { createDropdownEntries } from "../../../../utils/localeUtils"
import { Description } from "../../shared/Description"
import { sendVgLiteChatMessage } from "../../../chat/ChatCardManager"
import { CtxMenuItem, useContextMenu } from "../../../component/ContextMenu"
import { ItemChatCard } from "../../../chat/ItemChatCard"
import { Checkbox } from "../../../component/Checkbox"

export class EquipmentSheet extends VgLiteItemSheet {
    Component = EquipmentSheetReactComponent
    static DEFAULT_OPTIONS = {
        position: {
            width: 400,
            height: 400
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

    const baseContent = <div>
        <Bulk item={item} isEditMode={isEditMode} />
        <ItemValue item={item} isEditMode={isEditMode} />
        <ItemDivider />
    </div>

    return (
        <BaseEquipmentSheetHost
            header={
                <EquipmentSheetBanner
                    item={item}
                    isEditMode={isEditMode}
                    setIsEditMode={setIsEditMode}
                />
            }
            children={<EquipmentSheetBody children={<>
                {<Description obj={item} isEditMode={isEditMode} />}
                <CategorySelection item={item} isEditMode={isEditMode} />
                {sheet}
                <ItemDivider />
                {baseContent}
            </>} />}
        />
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

export const EquipmentSheetBanner = ({ item, isEditMode, setIsEditMode }: {
    item: FoundryItem<EquipmentDataModel<EquipmentSchema>>, isEditMode: boolean, setIsEditMode: any
}) => {
    const { onCtxMenu, ContextMenu } = useContextMenu()

    const editImage = () => {
        new foundry.applications.apps.FilePicker({
            type: "image",
            current: item.img,
            callback: async (path) => {
                // @ts-ignore
                await item.update({ 'img': path })
            }
        }).render()
    }

    const contextMenuItems: CtxMenuItem[] = []
    contextMenuItems.push(
        { icon: Pencil, label: 'Edit', action: () => editImage() },
        {
            icon: MessageSquareText, label: 'Send to chat', action: () => sendVgLiteChatMessage(
                null, <ItemChatCard itemId={item._id} itemName={item.name} />
            )
        }
    )
    return (<>
        <div className="flex space-x-1 items-center bg-section-header-fill px-1 font-eskapade font-bold">
            {item.img == null ? <></> :
                <div>
                    <img
                        className={`object-contain h-[54px] w-[54px] p-0.5`}
                        src={item.img}
                        alt={''}
                        onContextMenu={(e) => onCtxMenu(e, contextMenuItems)}
                    />
                    <ContextMenu />
                </div>
            }
            <div className="flex gap-x-1 w-full items-center text-2xl text-text-section-header">
                <EditableTextField
                    boundValue={item.name}
                    updateProps={{ object: item, path: ['name'] }}
                    placeholder={"Item name..."}
                    isGlobalEditMode={isEditMode}
                />
                <Divider />
                <div className="mr-2" onClick={() => setIsEditMode(!isEditMode)}>
                    {isEditMode ?
                        <LockKeyholeOpen size={18} strokeWidth={2} /> :
                        <LockKeyhole size={18} strokeWidth={2} />
                    }
                </div>
            </div>
        </div>
    </>)
}

export const EquipmentSheetBody = ({ children }: { children: React.ReactElement }) => {
    return (
        <div className="text-text-primary p-2">{children}</div>
    )
}

export const ItemSheetPropLabel = ({ label }) => {
    return <p className="font-paradigm font-bold">{label}:</p>
}
export const ItemSheetPropValue = ({ value, styleOverride }) => {
    return <div className={`${styleOverride.length === 0 ? "font-eskapade text-xl text-stat-block-fill" : styleOverride}`}>
        {value}
    </div>
}
export const ItemSheetProperty = ({ label, value, styleOverride = "" }) => {
    return (
        <div className="flex gap-x-2 items-center mt-1">
            <ItemSheetPropLabel label={label} />
            <ItemSheetPropValue value={value} styleOverride={styleOverride} />
        </div>
    )
}

const Bulk = ({ item, isEditMode }) => {
    const onCheckStackable = useCallback((isChecked) => {
        item.update({ 'system.bulk.isStackable': isChecked })
    }, [item.system.bulk.isStackable])
    return (
        <div className="flex w-full justify-between">
            <ItemSheetProperty label={lang.ItemSheet.slots} value={
                <EditableTextField
                    boundValue={item.system.bulk.slots}
                    updateProps={{ object: item, path: ['bulk', 'slots'] }}
                    placeholder="0"
                    isGlobalEditMode={isEditMode}
                />
            } />
            <Checkbox
                label={lang.ItemSheet.stackable}
                onCheckedChanged={onCheckStackable}
                checked={item.system.bulk.isStackable}
                isGlobalEditMode={isEditMode}
            />
        </div>
    )
}

const CategorySelection = ({ item, isEditMode }) => {
    return (
        <ItemSheetProperty label={lang.ItemSheet.category} value={
            isEditMode ? <DropDown
                value={item.system.category}
                options={createDropdownEntries(lang.EquipmentCategories)}
                updateMechanism={{ updatePath: ['category'] }}
                parent={item}
            /> : <>{lang.EquipmentCategories[item.system.category]}</>
        } styleOverride={"font-eskapade text-stat-block-fill"} />
    )
}

export const ItemValue = ({ item, isEditMode }) => {
    return (
        <ItemSheetProperty label={lang.ItemSheet.value} value={
            <div className="flex gap-x-1">
                <CoinDisplay item={item} label={lang.ItemSheet.g} path={'g'} isEditMode={isEditMode} />
                <CoinDisplay item={item} label={lang.ItemSheet.s} path={'s'} isEditMode={isEditMode} />
                <CoinDisplay item={item} label={lang.ItemSheet.c} path={'c'} isEditMode={isEditMode} />
            </div>
        } />
    )
}

const CoinDisplay = ({ item, label, path, isEditMode }) => {
    return (
        <div className="flex">
            <div className={`text-text-primary text-xl font-eskapade min-w-[2ch] text-right`}>
                <EditableTextField
                    boundValue={item.system.value[path]}
                    updateProps={{ object: item, path: ['value', path] }}
                    placeholder="0"
                    isGlobalEditMode={isEditMode}
                />
            </div>
            <div className={"text-wealth-denom-label text-xs content-end"}>{label}</div>
        </div>
    )
}