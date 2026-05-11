import HeroDataModel from "../../actor/HeroDataModel";
import EquipmentDataModel, { EquipmentSchema } from "./EquipmentDataModel";

const alchemicalItemSchema = () => {
    const f = foundry.data.fields;
    return {

    };
};

export type AlchemicalItemSchema = ReturnType<typeof alchemicalItemSchema> & EquipmentSchema

export default class AlchemicalItemDataModel extends EquipmentDataModel<AlchemicalItemSchema> {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            ...alchemicalItemSchema()
        };
    }

    override onEquip(hero: HeroDataModel) { }
    override onUse() { }
}