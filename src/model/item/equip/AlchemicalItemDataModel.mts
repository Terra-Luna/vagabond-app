import HeroDataModel from "../../actor/HeroDataModel.mjs"
import EquipmentDataModel, { EquipmentSchema } from "./EquipmentDataModel.mjs"

const alchemicalItemSchema = () => {
    const f = foundry.data.fields
    return {

    }
}

export type AlchemicalItemSchema = ReturnType<typeof alchemicalItemSchema> & EquipmentSchema

export default class AlchemicalItemDataModel extends EquipmentDataModel<AlchemicalItemSchema> {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            ...alchemicalItemSchema()
        }
    }

    override onEquip(hero: HeroDataModel) { }
    override onUse() { }
}