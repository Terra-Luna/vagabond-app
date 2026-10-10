import { ShoppingBag } from "lucide-react"
import { useState } from "react"

import { ItemShopApp } from "../../../../../apps/shop/ItemShopApp"
import { getItemShopToggle } from "../../../../../apps/vagabond-tools/usecase/VagabondSettingsHelper"
import { HeroDataModel } from "../../../../../model/actor/HeroDataModel"
import { isInContainer,sortedItems } from "../../../../../model/actor/type/Inventory"
import { ContainerDataModel } from "../../../../../model/item/equip/ContainerDataModel"
import { EquipmentDataModel, EquipmentSchema } from "../../../../../model/item/equip/EquipmentDataModel"
import { equipmentContextMenuItems } from "../../../../../utils/heroInventoryUtil"
import { appLang } from "../../../../../utils/lang"
import { tableBorder, tableBorderRounded } from "../../../../common/border-styles"
import { buttonAnimation, PrimaryButton } from "../../../../component/Button"
import { HeroCoinPurse } from "../../../../component/CoinPurse"
import { useContextMenu } from "../../../../component/ContextMenu"
import { Tooltip } from "../../../../component/Tooltip"
import { EditModeContextProvider } from "../../../../context/EditModeContext/EditModeContext"
import { EditModeOptions } from "../../../../context/EditModeContext/EditModeOptions"
import { ContainerSheet } from "../../../item/equip/sheet/ContainerSheet"
import { VagabondItemSheet } from "../../../item/VagabondItemSheet"
import { CapacityGauge } from "../../../shared/CapacityGauge"
import { InventoryItemsTable } from "../../../shared/InventoryItemsTable"
import { ItemIconImg } from "../../../shared/ItemIconImg"

export const InventoryTab = ({ hero }: { hero: HeroDataModel }) => {

    const itemShopToggle = getItemShopToggle()

    return (
        <div className="w-full min-h-16 mb-4">
            <div className="flex justify-between gap-1">
                <CapacityGauge label={appLang.HeroSheet.encumbrance} capacityInfo={hero.encumbranceInfo()} />
                <HeroCoinPurse hero={hero} />
            </div>
            <div className={`${tableBorder} mt-1 w-full`}>
                <InventoryItemsTable
                    actor={hero}
                    contextMenuItems={(item) => equipmentContextMenuItems(hero, item)}
                    items={
                        sortedItems<EquipmentDataModel<EquipmentSchema>>(
                            hero.inventory.items as EquipmentDataModel<EquipmentSchema>[]
                        ).filter(it => !isInContainer(it, hero.containers()) && it.parent.type !== "container")
                    }
                />
            </div>

            <Containers hero={hero} />

            <div className="flex gap-x-2 w-fill justify-end">
                {/* ITEM SHOP BUTTON */}
                {itemShopToggle &&
                    <div className="flex w-fll justify-end">
                        <PrimaryButton onClick={() => new ItemShopApp(hero.parent).render({ force: true })} icon={<ShoppingBag size={16} className="self-center" />}>
                            Shop
                        </PrimaryButton>
                    </div>
                }
            </div>

        </div>
    )
}

const Containers = ({ hero }: { hero: HeroDataModel }) => {
    const { ContextMenu, onCtxMenu } = useContextMenu()
    const containers = hero.containers()
        .sort((a, b) => a.parent.name.localeCompare(b.parent.name))
        .map(it => it.parent) as (Item & { system: ContainerDataModel })[]

    const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null)

    return (
        <div className="flex flex-wrap gap-1 mt-1">
            {containers.map((container, index) => (
                <Tooltip key={index} title={container.name} content={
                    <div className={`max-w-[360px] p-2 bg-sheet-main-fill rounded-md mb-2`}>
                        <EditModeContextProvider initialEditMode={EditModeOptions.NEVER}>
                            <ContainerSheet item={container} hideButtons={true} />
                        </EditModeContextProvider>
                    </div>
                }>
                    <button
                        onClick={() => container.sheet?.render(true)}
                        onContextMenu={(e) => onCtxMenu(e, [equipmentContextMenuItems(hero, container.system).pop()!])}
                        className={`
                            flex items-center pr-2 text-sm font-eskapade font-normal
                            ${buttonAnimation} ${tableBorderRounded}
                            ${dropTargetIndex === index ? "bg-sheet-header-fill text-text-header-primary" : "text-text-primary"}
                        `}
                        onDrop={(e) => {
                            setDropTargetIndex(null)
                            VagabondItemSheet.handleContainerItemDrop(e, container)
                        }}
                        onDragOver={() => {
                            setDropTargetIndex(index)
                        }}
                        onDragLeave={() => {
                            setDropTargetIndex(null)
                        }}
                    >
                        <ItemIconImg item={container.system} />
                        {`${container.name} (${container.system.capacity - container.system.emptySlots}/${container.system.capacity})`}
                    </button>
                </Tooltip>
            ))}

            <ContextMenu />

        </div>
    )
}