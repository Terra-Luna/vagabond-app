import { Book, FlaskRound, ShoppingBag } from "lucide-react"
import { useState } from "react"

import { AlchemyCraftingApp } from "../../../../../apps/alchemy/AlchemyCraftingApp"
import { AlchemySelectionApp } from "../../../../../apps/hero-choices/alchemy/AlchemySelectionApp"
import { ItemShopApp } from "../../../../../apps/shop/ItemShopApp"
import { getItemShopToggle } from "../../../../../apps/vagabond-tools/usecase/VagabondSettingsHelper"
import { HeroDataModel, isAlchemist } from "../../../../../model/actor/HeroDataModel"
import { isInContainer,sortedItems } from "../../../../../model/actor/type/Inventory"
import { ContainerDataModel } from "../../../../../model/item/equip/ContainerDataModel"
import { EquipmentDataModel, EquipmentSchema } from "../../../../../model/item/equip/EquipmentDataModel"
import { equipmentContextMenuItems, getContainers, getEncumbranceInfo, hasAlchemyToolsEquipped } from "../../../../../utils/heroInventoryUtil"
import { appLang } from "../../../../../utils/lang"
import { tableBorder, tableBorderRounded } from "../../../../common/border-styles"
import { buttonAnimation, PrimaryButton, SecondaryButton } from "../../../../component/Button"
import { HeroCoinPurse } from "../../../../component/CoinPurse"
import { useContextMenu } from "../../../../component/ContextMenu"
import { Tooltip } from "../../../../component/Tooltip"
import { EditModeContextProvider } from "../../../../context/EditModeContext/EditModeContext"
import { EditModeOptions } from "../../../../context/EditModeContext/EditModeOptions"
import { ContainerSheet } from "../../../item/equip/sheet/ContainerSheet"
import { VagabondItemSheet } from "../../../item/VagabondItemSheet"
import { CapacityGauge } from "../../../shared/CapacityGauge"
import { InventoryItemsTable, ItemIconImg } from "../../../shared/InventoryItemsTable"

export const InventoryTab = ({ hero }: { hero: HeroDataModel }) => {

    const itemShopToggle = getItemShopToggle()
    const showAlchemy = isAlchemist(hero)
    const hasAlchToolsEquipped = hasAlchemyToolsEquipped(hero)

    return (
        <div className="w-full min-h-16">
            <div className="flex justify-between gap-1">
                <CapacityGauge label={appLang.HeroSheet.encumbrance} capacityInfo={getEncumbranceInfo(hero)} />
                <HeroCoinPurse hero={hero} />
            </div>
            <div className={`${tableBorder} mt-1 w-full`}>
                <InventoryItemsTable
                    actor={hero}
                    contextMenuItems={(item) => equipmentContextMenuItems(hero, item)}
                    items={
                        sortedItems<EquipmentDataModel<EquipmentSchema>>(
                            hero.inventory.items as EquipmentDataModel<EquipmentSchema>[]
                        ).filter(it => !isInContainer(it, getContainers(hero)) && it.parent.type !== "container")
                    }
                />
            </div>

            <Containers hero={hero} />

            <div className="flex gap-x-2 w-fill justify-between mt-1 mb-8">
                <div className="flex gap-x-1 items-start">
                    {showAlchemy && <>
                        {/* SELECT ALCHEMY RECIPES */}
                        <PrimaryButton onClick={() => new AlchemySelectionApp(hero.parent).render({ force: true })}>
                            <div className="flex gap-x-1">
                                <Book size={18} className="self-center" />
                                {appLang.HeroSheet.Alchemy.recipesbtn}
                            </div>
                        </PrimaryButton>
                        {/* OPEN ALCHEMY CRAFTING APP (IF TOOLS ARE EQUIPPED) */}
                        <SecondaryButton onClick={() => {
                            if (hasAlchToolsEquipped) {
                                new AlchemyCraftingApp(hero.parent).render({ force: true })
                            }
                            else {
                                ui.notifications?.warn("Equip Alchemy Tools to craft items")
                            }
                        }}>
                            <div className="flex gap-x-1">
                                <FlaskRound size={18} className="self-center" />
                                {appLang.HeroSheet.Alchemy.craft}
                            </div>
                        </SecondaryButton>
                    </>}
                </div>

                {/* ITEM SHOP BUTTON */}
                {itemShopToggle &&
                    <div className="flex w-fll justify-end">
                        <PrimaryButton onClick={() => new ItemShopApp(hero.parent).render({ force: true })} icon={<ShoppingBag size={16} className="self-center" />}>
                            Shop
                        </PrimaryButton>
                    </div>
                }
            </div>

            <div className="mb-8" />
        </div>
    )
}

const Containers = ({ hero }: { hero: HeroDataModel }) => {
    const { ContextMenu, onCtxMenu } = useContextMenu()
    const containers = getContainers(hero)
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