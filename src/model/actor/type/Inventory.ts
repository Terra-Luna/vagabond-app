import { coinSchema, CoinValue, consolidate } from "../../common/CoinValue"
import { fields, requiredInteger } from "../../common/sharedSchemas"
import EquipmentDataModel from "../../item/equip/EquipmentDataModel"
import HeroDataModel from "../HeroDataModel"

export const inventorySchema = () => {
    return {
        coins: new fields.SchemaField({ ...coinSchema() }),
        occupiedSlots: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        maxSlots: new fields.NumberField({ integer: true, min: 8, initial: 8 }),
        slotBonus: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
        items: new fields.ArrayField( new fields.SchemaField({ ...EquipmentDataModel.defineSchema() }), { initial: [] } ),
        equipped: new fields.ArrayField(
            new fields.SchemaField({ ...EquipmentDataModel.defineSchema() })
        )
    }
}

export type InventorySchema = ReturnType<typeof inventorySchema>
export type Inventory = foundry.abstract.TypeDataModel<InventorySchema, any>

export function calculateInventoryData(hero: HeroDataModel) {
    consolidate(hero.inventory.coins as CoinValue)
    hero.inventory.items.forEach((i) => hero.inventory.occupiedSlots! += i.slots!)
    hero.inventory.maxSlots = Number(hero.stats.might) + 8 + hero.inventory.slotBonus! - hero.fatigue
}