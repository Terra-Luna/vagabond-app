import { Pencil, MessageSquareText } from "lucide-react"
import { useCallback } from "react"
import AlchemicalItemDataModel from "../../../../model/item/equip/AlchemicalItemDataModel"
import ArmorDataModel from "../../../../model/item/equip/ArmorDataModel"
import ContainerDataModel from "../../../../model/item/equip/ContainerDataModel"
import EquipmentDataModel, { EquipmentSchema } from "../../../../model/item/equip/EquipmentDataModel"
import StarterPackDataModel from "../../../../model/item/equip/StarterPackDataModel"
import SundryDataModel from "../../../../model/item/equip/SundryDataModel"
import ToolDataModel from "../../../../model/item/equip/ToolDataModel"
import WeaponDataModel from "../../../../model/item/equip/WeaponDataModel"
import { createDropdownEntries, createDropdownEntriesFromObj } from "../../../../utils/localeUtils"
import { getId } from "../../../../utils/modelUtil"
import { sendVgLiteChatMessage } from "../../../chat/ChatCardManager"
import { ItemChatCard } from "../../../chat/ItemChatCard"
import { sheetPropLabel, sheetPropValue } from "../../../common/text-styles"
import { Checkbox } from "../../../component/Checkbox"
import { useContextMenu, CtxMenuItem } from "../../../component/ContextMenu"
import { DropDown } from "../../../component/Dropdown"
import { EditableTextField } from "../../../component/EditableTextField"
import { ItemDivider, Divider } from "../../../component/Header"
import { useEditMode } from "../../../context/EditModeContext/Hooks"
import { Description } from "../../shared/Description"
import { AlchemicalSheet } from "./type/AlchemicalSheet"
import { ArmorSheet } from "./type/ArmorSheet"
import { ContainerSheet } from "./type/ContainerSheet"
import { StarterPackSheet } from "./type/StarterPackSheet"
import { SundrySheet } from "./type/SundrySheet"
import { ToolSheet } from "./type/ToolSheet"
import { WeaponSheet } from "./type/WeaponSheet"
import { lang as fullLang } from "../../../../utils/lang"
const lang = fullLang.VGLITE

export const EquipmentSheetReactComponent = ({ item }: { item: Item & { system: EquipmentDataModel<EquipmentSchema> } }) => {
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

    const sharedContent = <div className="flex flex-wrap justify-between gap-x-8 gap-y-6 w-full mt-1">
        <Bulk item={item} />
        <div className="space-y-2">
            <ItemValue item={item} />
            <CategorySelection item={item} />
        </div>
    </div>

    return (
        <BaseEquipmentSheetHost
            header={<>
                <EquipmentSheetBanner item={item} />
                <div className="my-1">{<Description obj={item} />}</div>
            </>}
            children={<EquipmentSheetBody children={<>
                {sheet}
                <ItemDivider />
                {sharedContent}
            </>} />}
        />
    )
}

export const BaseEquipmentSheetHost = ({ header, children }: { header: React.ReactElement, children: React.ReactElement }) => {
    return (
        <div className="bg-sheet-main-fill h-full overflow-y-auto border-2 border-solid border-section-header-fill/80 border-top-transparent rounded-b-md">
            {header}
            {children}
        </div>
    )
}

export const EquipmentSheetBanner = ({ item }: { item: Item & { system: EquipmentDataModel<EquipmentSchema> } }) => {
    const { editModeToggleBtn } = useEditMode()
    const { onCtxMenu, ContextMenu } = useContextMenu()

    const editImage = () => {
        new foundry.applications.apps.FilePicker({
            type: "image",
            current: item.img as any,
            callback: async (path) => {
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
                <div className="mt-0.5 mb-1 mr-2">
                    <img
                        className={`object-contain border border-solid border-text-header-primary rounded-sm`}
                        width={56}
                        height={56}
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
                />
                <Divider />
                {editModeToggleBtn}
            </div>
        </div>
    </>)
}

const EquipmentSheetBody = ({ children }: { children: React.ReactElement }) => {
    return <div className="text-text-primary px-3 pb-1">{children}</div>
}

export const EquipmentSheetSubtypeBody = ({ children }: { children: React.ReactElement }) => {
    return <div className="my-2">{children}</div>
}

export const ItemSheetPropLabel = ({ label, fontWeight = "font-normal" }) => {
    return <p className={`${sheetPropLabel} ${fontWeight}`}>{label}</p>
}

export const ItemSheetPropValue = ({ value }) => {
    return <div className={`${sheetPropValue}`}>
        {value}
    </div>
}

export const ItemSheetProperty = ({ label, value }) => {
    return (
        <div className="flex gap-x-2 items-center mt-1">
            <ItemSheetPropLabel label={label} />
            <ItemSheetPropValue value={value} />
        </div>
    )
}

const Bulk = ({ item }) => {
    const { isEditMode } = useEditMode()

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
                />
            } />
            {
                isEditMode || item.system.bulk.isStackable ?
                    <div>
                    <ItemSheetProperty label={lang.ItemSheet.stackable} value={
                        <Checkbox
                            label={''}
                            onCheckedChanged={onCheckStackable}
                            checked={item.system.bulk.isStackable}
                        />
                    } />
                        <ItemSheetProperty label={lang.ItemSheet.qty} value={
                            <EditableTextField
                                boundValue={item.system.bulk.quantity}
                                updateProps={{ object: item, path: ['bulk', 'quantity'] }}
                                placeholder="1"
                            />
                        } />
                    </div> : <></>
            }
            {
                item.system.bulk.isStackable && item.system.bulk.slots === 0 ?
                    <ItemSheetProperty label={lang.ItemSheet.stackSize} value={
                        <EditableTextField
                            boundValue={item.system.bulk.stackSize}
                            updateProps={{ object: item, path: ['bulk', 'stackSize'] }}
                            placeholder="100"
                        />
                    } /> : <></>
            }
        </div>
    )
}

const CategorySelection = ({ item }) => {
    return (
        <DropDown
            label={lang.ItemSheet.category}
            value={item.system.category}
            options={createDropdownEntries(lang.EquipmentCategories)}
            updateMechanism={{ updatePath: ['category'] }}
            parent={item}
        />
    )
}

export const ItemValue = ({ item }) => {
    return (
        <ItemSheetProperty label={lang.ItemSheet.value} value={
            <div className="flex gap-x-1">
                <CoinDisplay item={item} label={lang.ItemSheet.g} path={'g'} />
                <CoinDisplay item={item} label={lang.ItemSheet.s} path={'s'} />
                <CoinDisplay item={item} label={lang.ItemSheet.c} path={'c'} />
            </div>
        } />
    )
}

const CoinDisplay = ({ item, label, path }) => {
    return (
        <div className="flex">
            <div className={`text-text-primary text-xl font-eskapade min-w-[2ch] text-right`}>
                <EditableTextField
                    boundValue={item.system.value[path]}
                    updateProps={{ object: item, path: ['value', path] }}
                    placeholder="0"
                />
            </div>
            <div className={"text-wealth-denom-label text-xs content-end"}>{label}</div>
        </div>
    )
}

export const Material = ({ item }: { item: Item & { system: { material: string } } }) => {
    return (
        <DropDown
            label={lang.ItemSheet.material}
            value={item.system.material}
            options={createDropdownEntriesFromObj(lang.Metals)}
            updateMechanism={{ updatePath: ['material'] }}
            parent={item}
        />
    )
}

export const ConsumableToggle = ({ item }: { item: Item & { system: EquipmentDataModel<EquipmentSchema> } }) => {
    const onCheckConsumable = useCallback((isChecked) => {
        item.update({ 'system.isConsumable': isChecked } as Record<string, boolean>)
    }, [item])
    return (
        <Checkbox
            label={lang.ItemSheet.consumable}
            onCheckedChanged={onCheckConsumable}
            checked={item.system.isConsumable}
        />
    )
}