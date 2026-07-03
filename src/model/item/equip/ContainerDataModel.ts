import { fields, requiredInteger, requiredString } from "../../common/sharedSchemas"
import EquipmentDataModel, { EquipmentSchema } from "./EquipmentDataModel"

export const containerSchema = () => {
    return {
        capacity: new fields.NumberField({ ...requiredInteger, initial: 2 }),
        itemIds: new fields.ArrayField(new fields.StringField({ ...requiredString }), { initial: [] }),
        emptySlots: new fields.NumberField({ ...requiredInteger, initial: 2 })
    }
}

export type ContainerSchema = ReturnType<typeof containerSchema> & EquipmentSchema
export type Container = ContainerDataModel & EquipmentDataModel<ContainerSchema>

export default class ContainerDataModel extends EquipmentDataModel<ContainerSchema> {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            ...containerSchema()
        }
    }

    override async _onCreate(data: any, options: any, userId: string) {
        super._onCreate(data, options, userId)
        this.parent.update({
            'system.bulk.stackSize': 1,
            'system.bulk.slots': 0
        })
    }

    override async prepareBaseData() {
        super.prepareBaseData()
        this.bulk.isStackable = false
    }

    override async prepareDerivedData() {
        const bulk = containerItems(this).reduce((sum, i) => { return sum + (i.system.bulk.totalSlots ?? 0) }, 0)
        this.emptySlots = this.capacity - bulk
    }

}

export const containerItems = (container: ContainerDataModel) => {
    const actor = container.parent.actor
    if (!actor) return []
    return container.itemIds.map(id =>
        actor.items.get(id)
    ) as Item & { system: EquipmentDataModel<EquipmentSchema> }[]
}

export async function addItem(container: ContainerDataModel, item: Item & { system: EquipmentDataModel<EquipmentSchema> }) {
    console.log(item.id, container.parent.id)
    if (item.id && item.id !== container.parent.id) {
        if ((item.type as string) === 'container') {
            ui.notifications?.warn("Cannot place containers within containers!")
        }
        if (container.emptySlots > 0 && container.emptySlots >= item.system.bulk.totalSlots) {
            const itemIds = [...container.itemIds]
            if (!itemIds.includes(item.id)) {
                itemIds.push(item.id)
            }
            await container.parent.update({ 'system.itemIds': itemIds })
        }
        else {
            ui.notifications?.warn("Not enough space available in container!")
        }
    }
}

export async function extractItem(container: ContainerDataModel, item: Item & { system: EquipmentDataModel<EquipmentSchema> }) {
    if (item.id) {
        const itemIds = [...container.itemIds]
        if (itemIds.includes(item.id)) {
            await container.parent.update({ 'system.itemIds': itemIds.filter(id => id !== item.id) })
        }
    }
}