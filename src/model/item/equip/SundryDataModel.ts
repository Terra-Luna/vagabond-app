import { fields } from "../../common/sharedSchemas"
import { EquipmentDataModel, EquipmentSchema } from "./EquipmentDataModel"

/**
 * Random items with no discrete use-case.
 * Eg.: magnifying glass, compass, books...
 */
const sundrySchema = () => {
    return {
        isRation: new fields.BooleanField({ initial: false }),
        isMaterials: new fields.BooleanField({ initial: false }),
        isAlchemyTools: new fields.BooleanField({ initial: false }),
        isWearable: new fields.BooleanField({ initial: false })
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