import { Book, FlaskRound } from "lucide-react"

import { AlchemyCraftingApp } from "../../../../../apps/alchemy/AlchemyCraftingApp"
import { AlchemySelectionApp } from "../../../../../apps/hero-choices/alchemy/AlchemySelectionApp"
import { ItemShopApp } from "../../../../../apps/shop/ItemShopApp"
import { getItemShopToggle } from "../../../../../apps/vagabond-tools/usecase/VagabondSettingsHelper"
import { HeroDataModel, isAlchemist } from "../../../../../model/actor/HeroDataModel"
import { isInContainer,sortedItems } from "../../../../../model/actor/type/Inventory"
import { EquipmentDataModel, EquipmentSchema } from "../../../../../model/item/equip/EquipmentDataModel"
import { equipmentContextMenuItems, getContainers, getEncumbranceInfo, hasAlchemyToolsEquipped } from "../../../../../utils/heroInventoryUtil"
import { appLang } from "../../../../../utils/lang"
import { tableBorder } from "../../../../common/border-styles"
import { PrimaryButton, SecondaryButton } from "../../../../component/Button"
import { HeroCoinPurse } from "../../../../component/CoinPurse"
import { CapacityGauge } from "../../../shared/CapacityGauge"
import { InventoryItemsTable } from "../../../shared/InventoryItemsTable"

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
            <div className={`${tableBorder} mt-1 w-full ${itemShopToggle || showAlchemy ? '' : 'mb-28'}`}>
                <InventoryItemsTable
                    actor={hero}
                    items={
                        sortedItems<EquipmentDataModel<EquipmentSchema>>(
                            hero.inventory.items as EquipmentDataModel<EquipmentSchema>[]
                        ).filter(it => !isInContainer(it, getContainers(hero)))
                    }
                    contextMenuItems={(item) => equipmentContextMenuItems(hero, item)} />
            </div>

            <div className="flex gap-x-2 w-fill justify-between mt-1 mb-28">
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
                        <PrimaryButton onClick={() => new ItemShopApp(hero.parent).render({ force: true })}>
                            Item Shop
                        </PrimaryButton>
                    </div>
                }
            </div>
        </div>
    )
}