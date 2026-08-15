import { EquipmentDataModel, EquipmentSchema } from "./EquipmentDataModel"

/**
 * Anything a Hero can equip that isn't a weapon or armor.
 */
const toolSchema = () => {
    return {}
}

export type ToolSchema = ReturnType<typeof toolSchema> & EquipmentSchema

export class ToolDataModel extends EquipmentDataModel<ToolSchema> {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            ...toolSchema()
        }
    }

    override async _preCreate(data: any, options: any, user: any) {
        await super._preCreate(data, options, user)
        this.parent.updateSource({ 'system.category': 'tools' })
    }

    override prepareBaseData() {
        super.prepareBaseData()
        this.isEquippable = true
    }

}