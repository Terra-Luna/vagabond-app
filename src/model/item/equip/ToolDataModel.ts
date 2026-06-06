import EquipmentDataModel, { EquipmentSchema } from "./EquipmentDataModel"

/**
 * Anything a Hero can equip that isn't a weapon or armor.
 */
const toolSchema = () => {
    return {}
}

export type ToolSchema = ReturnType<typeof toolSchema> & EquipmentSchema

export default class GearDataModel extends EquipmentDataModel<ToolSchema> {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            ...toolSchema()
        }
    }
}