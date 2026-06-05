import { coinSchema, consolidateCoins } from "../../common/CoinValue"
import { fields, requiredInteger } from "../../common/sharedSchemas"
import EquipmentDataModel from "../../item/equip/EquipmentDataModel"
import HeroDataModel from "../HeroDataModel"

export const inventorySchema = () => {
    return {
        coins: new fields.SchemaField({ ...coinSchema() }),
        items: new fields.ArrayField(new fields.SchemaField({ ...EquipmentDataModel.defineSchema() }), { initial: [] }),
        capacity: new fields.NumberField({ ...requiredInteger, initial: 2 }),
        emptySlots: new fields.NumberField({ ...requiredInteger, initial: 2 })
    }
}

export function setInventoryData(hero: HeroDataModel) {
    consolidateCoins(hero.inventory.coins)
    hero.inventory.items = hero.parent.items.filter((i: any) => isInventoryItem(i)).map((i: any) => i.system)
    hero.inventory.capacity = Number(hero.stats.might) + 8 + hero.bonus.inventorySlots! - hero.fatigue!
    const bulk = hero.inventory?.items?.reduce((sum, i) => { return sum! + i.slots! * i.quantity! }, 0)
    hero.inventory.emptySlots = hero.inventory.capacity - bulk
}

export const isInventoryItem = (item: any): boolean => {
    return item.type === 'armor' ||
        item.type === 'weapon' ||
        item.type === 'tool' ||
        item.type === 'sundry' ||
        item.type === 'alchemical' ||
        item.type === 'container'
}   