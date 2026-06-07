import { fields, requiredInteger } from "../../common/sharedSchemas"
import EquipmentDataModel, { EquipmentSchema } from "./EquipmentDataModel"

export const containerSchema = () => {
    return {
        capacity: new fields.NumberField({ ...requiredInteger, initial: 2 }),
        emptySlots: new fields.NumberField({ ...requiredInteger, initial: 2 }),
        items: new fields.ArrayField(new fields.SchemaField({ ...EquipmentDataModel.defineSchema() }), { initial: [] })
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

    override async prepareDerivedData() {
        super.prepareDerivedData()
        setEmptySlots(this)
    }

    onAddItem(item: EquipmentDataModel<EquipmentSchema>, allowContainerNesting: boolean = false) {
        addItem(this, item, allowContainerNesting)
    }
}

export function setEmptySlots(container: ContainerDataModel) {
    container.emptySlots = container.capacity! - container.items.reduce((sum, it) => { return sum + it.slots! }, 0)
}

/**
 * Writing rules for placing containers within containers seems messy, let's just not.
 */
export function addItem(container: ContainerDataModel, item: EquipmentDataModel<EquipmentSchema>, allowContainerNesting: boolean = false) {
    if (allowContainerNesting || item.parent.type != "container") {
        if (container.emptySlots! >= item.slots!) {
            container.items.push(item)
        }
        else {
            ui.notifications?.warn("Not enough space available in container!")
        }
    }
    else {
        ui.notifications?.warn("Cannot place containers within containers!")
    }
}