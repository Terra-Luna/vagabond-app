import HeroDataModel from "../../actor/HeroDataModel"
import { fields, requiredInteger } from "../../common/sharedSchemas"
import VgLiteError from "../../common/VgLiteError"
import EquipmentDataModel, { EquipmentSchema } from "./EquipmentDataModel"

export const containerSchema = () => {
    return {
        size: new fields.NumberField({ ...requiredInteger, initial: 2 }),
        emptySlots: new fields.NumberField({ ...requiredInteger, initial: 2 }),
        items: new fields.ArrayField(new fields.SchemaField({ ...EquipmentDataModel.defineSchema() }))
    }
}

export type ContainerSchema = ReturnType<typeof containerSchema> & EquipmentSchema

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

    override onEquip(hero: HeroDataModel) { }
    override onUse() { }

    onAddItem(item: EquipmentDataModel<EquipmentSchema>) {
        addItem(this, item)
    }
}

export function setEmptySlots(container: ContainerDataModel) {
    var occupied = 0
    container.items.forEach(i => occupied += i.slots!)
    container.emptySlots = container.size! - occupied
}

export function addItem(container: ContainerDataModel, item: EquipmentDataModel<EquipmentSchema>) {
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

export class ContainerError extends VgLiteError<string> { }
export const NOT_ENOUGH_SPACE_ERROR = { name: 'NOT_ENOUGH_SPACE', message: 'Not enough space!' }