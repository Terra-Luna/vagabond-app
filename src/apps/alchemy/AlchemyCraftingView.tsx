import { useCallback, useMemo, useState } from "react"

import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { AlchemicalItemDataModel } from "../../model/item/equip/AlchemicalItemDataModel"
import { ItemsCache } from "../../rules/util/ItemsCache"
import { deleteItems, getAlchemyMaterials, useItem } from "../../utils/heroInventoryUtil"
import { appLang } from "../../utils/lang"
import { addItemToActor } from "../../utils/modelUtil"
import { useAlchemySelection } from "../hero-choices/alchemy/AlchemySelectionUseCase"
import { Recipes } from "../hero-choices/alchemy/Recipes"
import { AlchemyToolsPill } from "./component/AlchemyToolsPill"
import { MaterialsCounter } from "./component/MaterialsCounter"

export const AlchemyCraftingView = ({ actor }: { actor: Actor & { system: HeroDataModel } }) => {

    const [revision, setRevision] = useState(0)
    const { alchemySlots, alchemyItems } = useAlchemySelection(actor, false, true)
    const fullAlchemyItems = useMemo(() => { return ItemsCache.alchemical() }, [])
    const tools = useMemo(() => { return actor.items.find(it => (it.type as string) === 'sundry' && (it.system as any).isAlchemyTools)! }, [])

    const materials = useMemo(() => {
        return getAlchemyMaterials(actor).sort((a, b) => a.system.bulk.quantity - b.system.bulk.quantity)
    }, [revision])

    const materialsCount = useMemo(() => {
        return materials.reduce((sum, it) => sum + it.system.bulk.quantity, 0)
    }, [materials, revision])

    const consumeMaterials = async (): Promise<boolean> => {
        if (!materials[0]) {
            ui.notifications?.warn("Could not find crafting Materials.")
            return false
        }
        if (materials[0].system.bulk.quantity > 1) {
            await materials[0].update({ "system.bulk.quantity": materials[0].system.bulk.quantity - 1 } as Record<string, number>)
        }
        else {
            await deleteItems(actor, [materials[0].id!])
        }
        return true
    }

    /**
     * Spend Material and add item to Actor's inventory.
     */
    const addToInventory = useCallback(async (item) => {
        const fullItem = getFullItem(item.value)
        if (fullItem) {
            if (await consumeMaterials()) {
                await addItemToActor(actor, fullItem)
            }
        }
        else {
            ui.notifications?.error("Vagabond | Failed to craft Alchemical Item")
        }
        setRevision(current => current + 1)
    }, [actor, setRevision, materials])

    /**
     * Spend Material and use item directly without adding it to inventory.
     */
    const craftAndUse = useCallback(async (item) => {
        const fullItem = getFullItem(item.value)
        if (fullItem) {
            if (await consumeMaterials()) {
                await useItem(actor, fullItem, true)
            }
        }
        setRevision(current => current + 1)
    }, [actor, setRevision, materials])

    const getFullItem = (id): (Item & { system: AlchemicalItemDataModel }) | undefined => {
        return fullAlchemyItems.find(it => it.uuid === id)
    }

    return (
        <div className="flex flex-col p-1 h-full overflow-hidden">
            {/* STICKY HEADER */}
            <div className="flex justify-between items-center bg-sheet-header-fill rounded-sm p-2 -mx-2 -mt-2">
                <AlchemyToolsPill item={tools} />
                <MaterialsCounter text={materialsCount} />
            </div>

            <div className="flex-1 overflow-y-auto">
                <Recipes
                    alchemySlots={alchemySlots}
                    alchemyItems={alchemyItems}
                    hideCompendiumLink={true}
                    actions={[
                        { label: appLang.HeroSheet.Alchemy.craft, tooltip: appLang.HeroSheet.Alchemy.craft_tooltip, item: undefined, action: addToInventory},
                        { label: appLang.HeroSheet.Alchemy.use, tooltip: appLang.HeroSheet.Alchemy.use_tooltip, item: undefined, action: craftAndUse}
                    ]}
                />
            </div>

        </div>
    )
}