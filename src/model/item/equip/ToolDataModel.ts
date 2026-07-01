import lang from "../../../../public/lang/en.json"
import { fields, requiredString } from "../../common/sharedSchemas"
import EquipmentDataModel, { EquipmentSchema } from "./EquipmentDataModel"

/**
 * Anything a Hero can equip that isn't a weapon or armor.
 */
const toolSchema = () => {
    return {
        category: new fields.StringField({ ...requiredString, choices: Object.keys(lang.VGLITE.EquipmentCategories), initial: 'tools' }),
    }
}

export type ToolSchema = ReturnType<typeof toolSchema> & EquipmentSchema

export default class ToolDataModel extends EquipmentDataModel<ToolSchema> {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            ...toolSchema()
        }
    }

    override async prepareBaseData() {
        super.prepareBaseData()
        this.isEquippable = true
    }
}