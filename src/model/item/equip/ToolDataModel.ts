import EquipmentDataModel, { EquipmentSchema } from "./EquipmentDataModel"

/**
 * Anything a Hero can equip that isn't a weapon or armor.
 */
const toolSchema = () => {
    return {}
}

export type ToolSchema = ReturnType<typeof toolSchema> & EquipmentSchema

export default class ToolDataModel extends EquipmentDataModel<ToolSchema> {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            ...toolSchema()
        }
    }

    override async _onCreate(data: any, options: any, userId: string) {
        super._onCreate(data, options, userId)
        this.parent.update({
            'system.category': 'tools',
            'system.isConsumable': false,
            'system.bulk.stackSize': 1
        })
    }

    override async prepareBaseData() {
        super.prepareBaseData()
        this.isEquippable = true
    }
}