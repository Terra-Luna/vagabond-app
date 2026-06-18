import lang from "../../../../public/lang/en.json"
import { damageTypeOptions, fields, optionalString } from "../../common/sharedSchemas"
import EquipmentDataModel, { EquipmentSchema } from "./EquipmentDataModel"

const alchemicalSchema = () => {
    return {
        type: new fields.StringField({
            ...optionalString,
            initial: 'unk',
            choices: Object.keys(lang.VGLITE.AlchemyCategories)
        }),
        damage: new fields.StringField({ ...optionalString }),
        damageType: new fields.StringField({ ...damageTypeOptions() })
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

    override async prepareBaseData() {
        super.prepareBaseData()
        this.isStackable = true
    }
}