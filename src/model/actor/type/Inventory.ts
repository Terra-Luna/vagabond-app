import { coinSchema, CoinValue, consolidate } from "../../common/CoinValue"
import { fields, requiredInteger } from "../../common/sharedSchemas"
import ContainerDataModel from "../../item/equip/ContainerDataModel"
import EquipmentDataModel, { EquipmentSchema } from "../../item/equip/EquipmentDataModel"
import HeroDataModel from "../HeroDataModel"

export const inventorySchema = () => {
    return {
        coins: new fields.SchemaField({ ...coinSchema() }),
        occupiedSlots: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        container: new fields.SchemaField({ ...ContainerDataModel.defineSchema() }),
        slotBonus: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
        equipped: new fields.ArrayField(
            new fields.SchemaField({ ...EquipmentDataModel.defineSchema() })
        )
    }
}

export type InventorySchema = ReturnType<typeof inventorySchema>
export type Inventory = foundry.abstract.TypeDataModel<InventorySchema, any>

export function setInventoryData(hero: HeroDataModel) {
    consolidate(hero.inventory.coins as CoinValue)
    hero.inventory.container.items.forEach((i) => hero.inventory.occupiedSlots! += i.slots!)
    hero.inventory.container.size = Number(hero.stats.might) + 8 + hero.inventory.slotBonus! - hero.fatigue
}