import { groupBy } from "../../../utils/collectionUtil"
import { getId, getName } from "../../../utils/modelUtil"
import { coinSchema } from "../../common/CoinValue"
import { fields, requiredInteger } from "../../common/sharedSchemas"
import ArmorDataModel, { equipArmor } from "../../item/equip/ArmorDataModel"
import EquipmentDataModel, { EquipmentSchema, setEquipState } from "../../item/equip/EquipmentDataModel"
import WeaponDataModel, { equipWeapon } from "../../item/equip/WeaponDataModel"
import HeroDataModel from "../HeroDataModel"

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

export const getEncumbranceInfo = (hero: HeroDataModel): { bulk: number, capacity: number, isOverEncumbered: boolean } => {
    const capacity = hero.inventory.capacity ?? 10
    const bulk = hero.inventory.items.reduce((sum, i) => { return sum + (i.slots ?? 0) }, 0)
    const isOverEncumbered = bulk / capacity > 1
    return { bulk, capacity, isOverEncumbered }
}

export const setInventoryData = (hero: HeroDataModel) => {
    hero.inventory.items = hero.parent.items.filter((i: any) => isInventoryItem(i)).map((i: any) => i.system)
    hero.inventory.capacity = Number(hero.stats.might) + 8 - hero.fatigue!
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

export const useItem = async (hero: HeroDataModel, item: EquipmentDataModel<EquipmentSchema>) => {
    if (item) {
        await deleteItems(hero, [getId(item)])
        sendItemToChat(hero, item)
    }
    else {
        ui.notifications?.warn("Item not found!")
    }
}

export const sendItemToChat = (hero: HeroDataModel, item: EquipmentDataModel<EquipmentSchema>) => {
    ChatMessage.create({
        speaker: { actor: getId(hero), alias: getName(hero) },
        content: `<h4>${getName(hero)} </h4><p> used item: ${getName(item)}</p>`
    })
}

export const equipItem = (hero: HeroDataModel, item: EquipmentDataModel<EquipmentSchema>) => {
    if (item.parent.type instanceof ArmorDataModel) {
        equipArmor(hero, item as ArmorDataModel)
    }
    else if (item.parent.type instanceof WeaponDataModel) {
        equipWeapon(hero, item as WeaponDataModel)
    }
    else if (item.isEquippable) {
        setEquipState(item, true)
    }
}

export const openItemSheet = (item: EquipmentDataModel<EquipmentSchema>) => {
    if (item) {
        item.parent.sheet.render(true)
    }
    else {
        ui.notifications?.warn("Item not found!")
    }
}

export const deleteItems = async (hero: HeroDataModel, itemIds: string[]) => {
    await hero.parent.deleteEmbeddedDocuments("Item", itemIds)
}