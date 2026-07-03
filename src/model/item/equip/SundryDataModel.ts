import EquipmentDataModel, { EquipmentSchema } from "./EquipmentDataModel"

/**
 * Random items with no discrete use-case.
 * Eg.: magnifying glass, compass, books...
 */
const sundrySchema = () => {
    return {}
}

export type SundrySchema = ReturnType<typeof sundrySchema> & EquipmentSchema

export default class SundryDataModel extends EquipmentDataModel<SundrySchema> {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            ...sundrySchema()
        }
    }

    override async _onCreate(data: any, options: any, userId: string) {
        super._onCreate(data, options, userId)
        this.parent.update({
            'system.isConsumable': false,
            'system.bulk.isStackable': true,
            'system.bulk.slots': 0,
            'system.bulk.stackSize': 10
        })
    }
}