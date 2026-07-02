import { VGLITE as lang } from "../../../../../public/lang/en.json"
import { useCallback, useState } from "react"
import ArmorDataModel from "../../../../model/item/equip/ArmorDataModel"
import EquipmentDataModel, { EquipmentSchema } from "../../../../model/item/equip/EquipmentDataModel"
import { Divider, ItemDivider } from "../../../component/Header"
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
import { sheetPropLabel } from "../../../common/text-styles"
import { VgLiteItemSheet } from "../VgLiteItemSheet"
import { getId } from "../../../../utils/modelUtil"

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

const EquipmentSheetReactComponent = ({ item }: { item: Item & { system: EquipmentDataModel<EquipmentSchema> } }) => {
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

    const baseContent = <div className="flex flex-wrap justify-between gap-x-12 gap-y-4 w-full">
        <Bulk item={item} isEditMode={isEditMode} />
        <div className="space-y-2">
            <ItemValue item={item} isEditMode={isEditMode} />
            <CategorySelection item={item} isEditMode={isEditMode} />
        </div>
    </div>

    return (
        <BaseEquipmentSheetHost
            header={<>
                <EquipmentSheetBanner
                    item={item}
                    isEditMode={isEditMode}
                    setIsEditMode={setIsEditMode}
                />
                <div className="my-1">
                    {<Description obj={item} isEditMode={isEditMode} />}
                </div>
            </>}
            children={<EquipmentSheetBody children={<>
                {sheet}
                <ItemDivider />
                {baseContent}
            </>} />}
        />
    )
}

export const BaseEquipmentSheetHost = ({ header, children }: { header: React.ReactElement, children: React.ReactElement }) => {
    return (
        <div className="bg-sheet-main-fill overflow-y-auto">
            {header}
            {children}
        </div>
    )
}

export const EquipmentSheetBanner = ({ item, isEditMode, setIsEditMode }: {
    item: Item & { system: EquipmentDataModel<EquipmentSchema> }, isEditMode: boolean, setIsEditMode: any
}) => {
    const { onCtxMenu, ContextMenu } = useContextMenu()

    const editImage = () => {
        new foundry.applications.apps.FilePicker({
            type: "image",
            current: item.img as any,
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
                null, <ItemChatCard itemId={getId(item)} itemName={item.name} />
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

const EquipmentSheetBody = ({ children }: { children: React.ReactElement }) => {
    return <div className="text-text-primary px-2">{children}</div>
}

export const EquipmentSheetSubtypeBody = ({ children }: { children: React.ReactElement }) => {
    return <div className="my-1">{children}</div>
}

export const ItemSheetPropLabel = ({ label }) => {
    return <p className={sheetPropLabel}>{label}</p>
}
export const ItemSheetPropValue = ({ value, styleOverride = '' }) => {
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
        <div>
            <ItemSheetProperty label={lang.ItemSheet.slots} value={
                <EditableTextField
                    boundValue={item.system.bulk.slots}
                    updateProps={{ object: item, path: ['bulk', 'slots'] }}
                    placeholder="0"
                    isGlobalEditMode={isEditMode}
                />
            } />
            <ItemSheetProperty label={lang.ItemSheet.stackable} value={
                <Checkbox
                    label={''}
                    onCheckedChanged={onCheckStackable}
                    checked={item.system.bulk.isStackable}
                    isGlobalEditMode={isEditMode}
                />
            } />
            {
                item.system.bulk.isStackable ? 
                    <ItemSheetProperty label={lang.ItemSheet.stackSize} value={
                        <EditableTextField
                            boundValue={item.system.bulk.stackSize}
                            updateProps={{ object: item, path: ['bulk', 'stackSize'] }}
                            placeholder="100"
                            isGlobalEditMode={isEditMode}
                        />
                    } /> : <></>
            }
        </div>
    )
}

const CategorySelection = ({ item, isEditMode }) => {
    return (<>
        {
            isEditMode ?
                <DropDown
                    label={lang.ItemSheet.category}
                    value={item.system.category}
                    options={createDropdownEntries(lang.EquipmentCategories)}
                    updateMechanism={{ updatePath: ['category'] }}
                    parent={item}
                /> :
                <div>
                    <ItemSheetPropLabel label={lang.ItemSheet.category} />
                    <ItemSheetPropValue value={lang.EquipmentCategories[item.system.category]} />
                </div>
        }
    </>)
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