import lang from "../../../../public/lang/en.json"
import HeroDataModel from "../../actor/HeroDataModel"
import { fields, optionalString, requiredString } from "../../common/sharedSchemas"
import EquipmentDataModel, { EquipmentSchema } from "./EquipmentDataModel"

const alchemicalSchema = () => {
    return {
        type: new fields.StringField({ ...requiredString, initial: 'Acid', choices: Object.values(lang.VGLITE.AlchemyCategories).map(it => it.name) }),
        damage: new fields.StringField({ ...optionalString }),
        damageType: new fields.StringField({ ...optionalString, choices: Object.values(lang.VGLITE.DamageTypes) })
    }
}

export type AlchemicalSchema = ReturnType<typeof alchemicalSchema> & EquipmentSchema

export default class AlchemicalItemDataModel extends EquipmentDataModel<AlchemicalSchema> {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            ...alchemicalSchema()
        }
    }

    override typeName: String = "Alchemical"
    override onEquip(hero: HeroDataModel) { }
    override onUnEquip(hero: HeroDataModel) { }
    override onUse() { }
}