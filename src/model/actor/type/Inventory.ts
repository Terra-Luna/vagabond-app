import { groupBy } from "../../../utils/collectionUtil"
import { getId, getName } from "../../../utils/modelUtil"
import { coinSchema } from "../../common/CoinValue"
import { fields, requiredInteger } from "../../common/sharedSchemas"
import EquipmentDataModel, { EquipmentSchema } from "../../item/equip/EquipmentDataModel"
import HeroDataModel from "../HeroDataModel"

export const inventorySchema = () => {
    return {
        coins: new fields.SchemaField({ ...coinSchema() }),
        capacity: new fields.NumberField({ ...requiredInteger, initial: 2 }),
        emptySlots: new fields.NumberField({ ...requiredInteger, initial: 2 }),
        /**
         * Derived from Actor's Embedded Documents.
         */
        items: new fields.ArrayField(new fields.SchemaField({ ...EquipmentDataModel.defineSchema() }), { initial: [] })
    }
}

export const setInventoryData = (hero: HeroDataModel) => {
    hero.inventory.items = hero.parent.items.filter((i: any) => isInventoryItem(i)).map((i: any) => i.system)
    hero.inventory.capacity = Number(hero.stats.might) + 8 - hero.fatigue!
    const bulk = hero.inventory?.items?.reduce((sum, i) => { return sum! + i.slots! * i.quantity! }, 0)
    hero.inventory.emptySlots = hero.inventory.capacity - bulk
}

export const stackStackables = async (hero: HeroDataModel) => {
    const stackables = hero.parent.items?.filter((it: any) => isInventoryItem(it) && it.system.isStackable) as Item[]
    if (stackables?.length > 0) {
        ((Object.values(groupBy('name', stackables))) as any[][]).filter(it => it.length > 1).forEach(async items => {
            await items[0].update({ 'system.quantity': items.length })
            await deleteItems(
                hero,
                items.filter(it => it.system.quantity === 1).map(it => it._id)
            )
        })
    }
}

export const itemNameQty = (item: EquipmentDataModel<EquipmentSchema>): string => {
    return item.quantity === 1 ? getName(item) : `${getName(item)} (x${item.quantity})`
}

export const sortedItems = <T>(items: T[]): T[] => {
    return items.sort((a: any, b: any) => a.parent.sort === 0 ? 999999 : a.parent.sort - b.parent.sort)
}

export const isInventoryItem = (item: any): boolean => {
    return item.type === 'armor' ||
        item.type === 'weapon' ||
        item.type === 'tool' ||
        item.type === 'sundry' ||
        item.type === 'alchemical' ||
        item.type === 'container'
}

export const openItemSheet = (hero: HeroDataModel, itemId: string) => {
    const item = hero.parent.items.get(itemId)
    if (item) {
        item.sheet.render(true)
    }
    else {
        ui.notifications?.warn("Item not found!")
    }
}

export const deleteItems = async (hero: HeroDataModel, itemIds: string[]) => {
    await hero.parent.deleteEmbeddedDocuments("Item", itemIds)
}