import HeroDataModel from "../../actor/HeroDataModel"
import EquipmentDataModel, { EquipmentSchema } from "./EquipmentDataModel"

const gearSchema = () => {
    const f = foundry.data.fields
    return {

    }
}

export type GearSchema = ReturnType<typeof gearSchema> & EquipmentSchema

export default class GearDataModel<T extends GearSchema> extends EquipmentDataModel<T> {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            ...gearSchema()
        }
    }

    override onEquip(hero: HeroDataModel) { }
    override onUse() { }
}