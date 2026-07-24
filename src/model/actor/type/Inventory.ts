import { getName } from "../../../utils/modelUtil"
import { coinSchema } from "../../common/CoinValue"
import { fields, requiredInteger } from "../../common/sharedSchemas"
import { ContainerDataModel } from "../../item/equip/ContainerDataModel"
import { EquipmentDataModel, EquipmentSchema } from "../../item/equip/EquipmentDataModel"

export const inventorySchema = () => {
    return {
        coins: new fields.SchemaField({ ...coinSchema() }),
        capacity: new fields.NumberField({ ...requiredInteger, initial: 0 }),
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

export const isInventoryItem = (item: Item): boolean => {
    return inventoryItemTypes().includes(item.type)
}

export const inventoryItemTypes = () => {
    return ['armor', 'weapon', 'tool', 'sundry', 'alchemical', 'container']
}

export const openItemSheet = (item: any) => {
    if (item) {
        if (item.parent) {
            item.parent.sheet.render(true)
        }
        else {
            item.sheet.render(true)
        }
    }
    else {
        ui.notifications?.warn("Item not found!")
    }
}