import { coinSchema, CoinValue, consolidate } from "../../common/CoinValue"
import { fields } from "../../common/sharedSchemas"
import ContainerDataModel from "../../item/equip/ContainerDataModel"
import HeroDataModel from "../HeroDataModel"

export const inventorySchema = () => {
    return {
        coins: new fields.SchemaField({ ...coinSchema() }),
        container: new fields.SchemaField({ ...ContainerDataModel.defineSchema() }),
        slotBonus: new fields.NumberField({ integer: true, min: 0, initial: 0 })
    }
}

export type InventorySchema = ReturnType<typeof inventorySchema>
export type Inventory = foundry.abstract.TypeDataModel<InventorySchema, any>

export function setInventoryData(hero: HeroDataModel) {
    consolidate(hero.inventory.coins as CoinValue)
    hero.inventory.container.capacity = Number(hero.stats.might) + 8 + hero.inventory.slotBonus! - hero.fatigue
}