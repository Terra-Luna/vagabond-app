import { getId } from "../../../utils/modelUtil"
import { fields, requiredInteger, requiredString } from "../../common/sharedSchemas"
import EquipmentDataModel, { EquipmentSchema, getTotalSlots } from "./EquipmentDataModel"

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

    override async prepareBaseData() {
        super.prepareBaseData()
        this.bulk.isStackable = false
    }

    override async prepareDerivedData() {
        const items = containerItems(this)
        const bulk = items.reduce((sum, i) => { return sum + getTotalSlots(i?.system) }, 0)
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
    const itemId = getId(item)
    if (itemId && itemId !== container.parent.id && !container.itemIds.includes(itemId)) {
        if ((item.type as string) === 'container') {
            ui.notifications?.warn("Cannot place containers within containers!")
        }
        if (container.emptySlots > 0 && container.emptySlots >= item.system.bulk.totalSlots) {
            const itemIds = [...container.itemIds]
            if (!itemIds.includes(itemId)) {
                itemIds.push(itemId)
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