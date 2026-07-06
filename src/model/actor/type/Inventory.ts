import { getName } from "../../../utils/modelUtil"
import { coinSchema } from "../../common/CoinValue"
import { fields, requiredInteger } from "../../common/sharedSchemas"
import { ContainerDataModel } from "../../item/equip/ContainerDataModel"
import { EquipmentDataModel, EquipmentSchema } from "../../item/equip/EquipmentDataModel"

export const inventorySchema = () => {
    return {
        coins: new fields.SchemaField({ ...coinSchema() }),
        capacity: new fields.NumberField({ ...requiredInteger, initial: 2 }),
        /**
         * Derived from Actor's Embedded Documents.
         */
        items: new fields.ArrayField(new fields.SchemaField({ ...EquipmentDataModel.defineSchema() }), { initial: [] })
    }
}

export const isInContainer = (item, containers) => {
    return containers.find(c => c.itemIds.includes(item?.parent?.id ?? item.id)) !== undefined
}

export const itemNameQty = (item: EquipmentDataModel<EquipmentSchema>): string => {
    let name = getName(item)
    if (item instanceof ContainerDataModel) {
        name += ` (${(item.capacity) - item.emptySlots}/${item.capacity})`
    }
    else {
        item.bulk.quantity > 1 ? name += ` (x${item.bulk.quantity})` : {}
    }
    return name
}

export const sortedItems = <T>(items: EquipmentDataModel<EquipmentSchema>[]): T[] => {
    return items.sort((a: any, b: any) => a.parent.sort === 0 ? 999999 : a.parent.sort - b.parent.sort) as T[]
}

export const isInventoryItem = (item: any): boolean => {
    return item.type === 'armor' ||
        item.type === 'weapon' ||
        item.type === 'tool' ||
        item.type === 'sundry' ||
        item.type === 'alchemical' ||
        item.type === 'container'
}

export const openItemSheet = (item: any) => {
    if (item) {
        item.parent.sheet.render(true)
    }
    else {
        ui.notifications?.warn("Item not found!")
    }
}