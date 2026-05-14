import HeroDataModel from "../../actor/HeroDataModel"
import { fields, requiredInteger } from "../../common/sharedSchemas"
import VgLiteError from "../../common/VgLiteError"
import EquipmentDataModel, { EquipmentSchema } from "./EquipmentDataModel"

export const containerSchema = () => {
    return {
        capacity: new fields.NumberField({ ...requiredInteger, initial: 2 }),
        emptySlots: new fields.NumberField({ ...requiredInteger, initial: 2 }),
        items: new fields.ArrayField(new fields.SchemaField({ ...EquipmentDataModel.defineSchema() }))
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

    override typeName = "Container"
    override onEquip(hero: HeroDataModel) { }
    override onUse() { }

    onAddItem(item: EquipmentDataModel<EquipmentSchema>, allowContainerNesting: boolean = false) {
        addItem(this, item, allowContainerNesting)
    }
}

export function setEmptySlots(container: ContainerDataModel) {
    var occupied = 0
    container.items.forEach(i => occupied += i.slots!)
    container.emptySlots = container.capacity! - occupied
}

/**
 * Writing rules for placing containers within containers seems messy, let's just not.
 */
export function addItem(container: ContainerDataModel, item: EquipmentDataModel<EquipmentSchema>, allowContainerNesting: boolean = false) {
    if (allowContainerNesting || item.typeName != "Container") {
        if (container.emptySlots! >= item.slots!) {
            container.items.push(item)
        }
        else {
            throw new ContainerError({
                name: NOT_ENOUGH_SPACE_ERROR.name,
                message: NOT_ENOUGH_SPACE_ERROR.message
            })
        }
    }
    else {
        throw new ContainerError({
            name: CONTAINER_NESTING_ERROR.name,
            message: CONTAINER_NESTING_ERROR.message
        })
    }
}

export class ContainerError extends VgLiteError<string> { }
export const CONTAINER_NESTING_ERROR = { name: 'CONTAINER_NESTING_ERROR', message: 'Cannot put a container in a container' }
export const NOT_ENOUGH_SPACE_ERROR = { name: 'NOT_ENOUGH_SPACE', message: 'Not enough space' }