import HeroDataModel from "../../actor/HeroDataModel"
import EquipmentDataModel, { EquipmentSchema } from "./EquipmentDataModel"

/**
 * Anything a Hero can equip that isn't a weapon or armor.
 */
const toolSchema = () => {
    return {}
}

export type ToolSchema = ReturnType<typeof toolSchema> & EquipmentSchema

export default class GearDataModel extends EquipmentDataModel<ToolSchema> {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            ...toolSchema()
        }
    }

    override typeName: String = "Tool"
    override onEquip(hero: HeroDataModel) { }
    override onUnEquip(hero: HeroDataModel) { }
    override onUse() { }
}