import { getId } from "../../../utils/modelUtil"
import { fields, requiredInteger, requiredString } from "../../common/sharedSchemas"
import { EquipmentDataModel, EquipmentSchema, getTotalSlots } from "./EquipmentDataModel"

export const containerSchema = () => {
    return {
        capacity: new fields.NumberField({ ...requiredInteger, initial: 2 }),
        itemIds: new fields.ArrayField(new fields.StringField({ ...requiredString }), { initial: [] }),
        emptySlots: new fields.NumberField({ ...requiredInteger, initial: 2 })
    }
}

export type ContainerSchema = ReturnType<typeof containerSchema> & EquipmentSchema
export type Container = ContainerDataModel & EquipmentDataModel<ContainerSchema>

export class ContainerDataModel extends EquipmentDataModel<ContainerSchema> {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            ...containerSchema()
        }
    }

    override async _preCreate(data: any, options: any, user: any) {
        await super._preCreate(data, options, user)
        this.parent.updateSource({ 'system.category': 'containers' })
    }

    override prepareBaseData() {
        super.prepareBaseData()
        this.bulk.isStackable = false
    }

    override prepareDerivedData() {
        const items = itemsInContainer(this)
        const bulk = items.reduce((sum, i) => { return sum + getTotalSlots(i?.system) }, 0)
        this.emptySlots = this.capacity - bulk
    }

}

export const itemsInContainer = (container: ContainerDataModel) => {
    const actor = container.parent.actor
    if (!actor) return []
    const items: Item[] = []
    container.itemIds.forEach(id => {
        const item = actor.items.get(id)
        if (item) items.push(item)
    })
    return items as unknown as Item & { system: EquipmentDataModel<EquipmentSchema> }[]
}

export const allItemIdsInContainers = (actor: any): string[] => {
    const containers = actor.items.filter(it => (it.type === 'container')) as Item & { system: ContainerDataModel }[]
    return containers.map(c => c.system.itemIds).flat()
}

const containerWithItem = (actor, itemId): Item & { system: ContainerDataModel } | null => {
    const containers = actor.items.filter(it => it.type === 'container') as Item & { system: ContainerDataModel }[]
    return containers?.find(it => it.system.itemIds.includes(itemId)) as any
}

export async function addItemToContainer(container: ContainerDataModel, item: Item & { system: EquipmentDataModel<EquipmentSchema> }): Promise<boolean> {
    const itemId = getId(item)
    if (itemId && itemId !== container.parent.id && !container.itemIds.includes(itemId)) {
        if ((item.type as string) === 'container') {
            ui.notifications?.warn("Cannot place containers within containers!")
            return false
        }
        if (item.system.isEquipped) {
            ui.notifications?.warn("Unequip gear before placing in storage!")
            return false
        }
        if (container.emptySlots > 0 && container.emptySlots >= item.system.bulk.totalSlots) {
            const itemIds = [...container.itemIds]
            if (!itemIds.includes(itemId)) {
                itemIds.push(itemId)
                /**
                 * If this item is already in another container, transfer it to the
                 * new one by removing its ID.
                 */
                if (allItemIdsInContainers(item.actor).includes(itemId)) {
                    const transferContainer = containerWithItem(item.actor, itemId)
                    transferContainer?.update({
                        'system.itemIds': transferContainer.system.itemIds.filter(it => it != itemId)
                    } as Record<string, string[]>)
                }
                await container.parent.update({ 'system.itemIds': itemIds })
                return true
            }
            return false
        }
        else {
            ui.notifications?.warn("Not enough space available in container!")
            return false
        }
    }
    else {
        return false
    }
}

export async function extractItemFromContainer(container: ContainerDataModel, item: Item & { system: EquipmentDataModel<EquipmentSchema> }) {
    if (item.id) {
        const itemIds = [...container.itemIds]
        if (itemIds.includes(item.id)) {
            await container.parent.update({ 'system.itemIds': itemIds.filter(id => id !== item.id) })
        }
    }
}