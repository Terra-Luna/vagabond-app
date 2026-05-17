import HeroDataModel from "../../actor/HeroDataModel"
import EquipmentDataModel, { EquipmentSchema } from "./EquipmentDataModel"

/**
 * Random items with no discrete use-case.
 * Eg.: magnifying glass, compass, books...
 */
const sundrySchema = () => {
    return {

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

    override typeName: String = "Sundry"
    override onEquip(hero: HeroDataModel) { }
    override onUnEquip(hero: HeroDataModel) { }
    override onUse() { }
}