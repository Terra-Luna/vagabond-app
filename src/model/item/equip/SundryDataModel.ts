import { fields } from "../../common/sharedSchemas"
import { EquipmentDataModel, EquipmentSchema } from "./EquipmentDataModel"

/**
 * Random items with no discrete use-case.
 * Eg.: magnifying glass, compass, books...
 */
const sundrySchema = () => {
    return {
        isRation: new fields.BooleanField({ required: false, initial: false })
    }
}

export type SundrySchema = ReturnType<typeof sundrySchema> & EquipmentSchema

export class SundryDataModel extends EquipmentDataModel<SundrySchema> {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            ...sundrySchema()
        }
    }

}