import HeroDataModel from "../../actor/HeroDataModel.mjs"
import EquipmentDataModel, { EquipmentSchema } from "./EquipmentDataModel.mjs"

const sundrySchema = () => {
    const f = foundry.data.fields
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