import HeroDataModel from "../../actor/HeroDataModel"
import EquipmentDataModel, { EquipmentSchema } from "./EquipmentDataModel"

const sundrySchema = () => {
    return {

    }
}

export type SundrySchema = ReturnType<typeof sundrySchema> & EquipmentSchema

export default class SundryDataModel<T extends SundrySchema> extends EquipmentDataModel<T> {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            ...sundrySchema()
        }
    }

    override onEquip(hero: HeroDataModel) { }

    override onUse() { }
}