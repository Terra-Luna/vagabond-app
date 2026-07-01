import lang from "../../../../public/lang/en.json"
import { fields, requiredString } from "../../common/sharedSchemas"
import EquipmentDataModel, { EquipmentSchema } from "./EquipmentDataModel"

/**
 * Random items with no discrete use-case.
 * Eg.: magnifying glass, compass, books...
 */
const sundrySchema = () => {
    return {
        category: new fields.StringField({ ...requiredString, choices: Object.keys(lang.VGLITE.EquipmentCategories), initial: 'other' }),
    }
}

export type SundrySchema = ReturnType<typeof sundrySchema> & EquipmentSchema

export default class SundryDataModel extends EquipmentDataModel<SundrySchema> {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            ...sundrySchema()
        }
    }
}