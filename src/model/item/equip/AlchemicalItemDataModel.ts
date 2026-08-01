import { lang, vgLiteLang } from "../../../utils/lang"
import { damageTypeOptions, fields, optionalString, requiredString } from "../../common/sharedSchemas"
import { EquipmentDataModel, EquipmentSchema } from "./EquipmentDataModel"

const alchemicalSchema = () => {
    return {
        alchemyCategory: new fields.StringField({
            ...optionalString,
            initial: 'unk',
            choices: Object.keys(lang.VGLITE.AlchemyCategories)
        }),
        damage: new fields.SchemaField({
            oneHand: new fields.StringField({ ...optionalString, initial: '1d6' }),
            type: new fields.StringField({ ...damageTypeOptions() }),
            appliedEffects: new fields.ArrayField(
                new fields.SchemaField({
                    effect: new fields.StringField({ ...requiredString, choices: Object.keys(vgLiteLang.StatusConditions) }),
                    duration: new fields.StringField({ ...requiredString, initial: "Cd4" })
                }),
                { initial: [] }
            )
        }),
        explodeData: new fields.SchemaField({
            canExplode: new fields.BooleanField({ initial: false }),
            explodesOn: new fields.ArrayField(
                new fields.NumberField({ integer: true, initial: 0, required: false }),
                { initial: [] }
            )
        })
    }
}

export type AlchemicalSchema = ReturnType<typeof alchemicalSchema> & EquipmentSchema

export class AlchemicalItemDataModel extends EquipmentDataModel<AlchemicalSchema> {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            ...alchemicalSchema()
        }
    }

    override async _onCreate(data: any, options: any, userId: string) {
        super._onCreate(data, options, userId)
        this.parent.update({
            'system.category': 'alchemy'
        })
    }

    override prepareBaseData() {
        super.prepareBaseData()
        this.bulk.isStackable = true
    }
}