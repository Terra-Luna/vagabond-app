import { lang, vgLiteLang } from "../../../utils/lang"
import { damageTypeOptions, fields, optionalString, requiredInteger, requiredString } from "../../common/sharedSchemas"
import { EquipmentDataModel, EquipmentSchema } from "./EquipmentDataModel"

const alchemicalSchema = () => {
    return {
        alchemyCategory: new fields.StringField({
            ...optionalString,
            initial: 'unk',
            choices: Object.keys(lang.VGLITE.AlchemyCategories)
        }),
        damage: new fields.SchemaField({
            dice: new fields.SchemaField({
                count: new fields.NumberField({ ...requiredInteger, initial: 0 }),
                faces: new fields.NumberField({ ...requiredInteger, initial: 4, min: 1, max: 20 }),
                modifier: new fields.NumberField({ ...requiredInteger, initial: 0 }),
                explodesOn: new fields.ArrayField(
                    new fields.NumberField({ integer: true, initial: 0, required: false }),
                    { initial: [] }
                )
            }, { initial: {} }),
            type: new fields.StringField({ ...damageTypeOptions() }),
            appliedEffects: new fields.ArrayField(
                new fields.SchemaField({
                    effect: new fields.StringField({ ...requiredString, choices: Object.keys(vgLiteLang.StatusConditions) }),
                    duration: new fields.StringField({ ...optionalString })
                }),
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

    override async _preCreate(data: any, options: any, user: any) {
        await super._preCreate(data, options, user)
        this.parent.updateSource({
            'system.category': 'alchemy',
            'system.isConsumable': true
        })
    }

    override prepareBaseData() {
        super.prepareBaseData()
        this.bulk.isStackable = true
    }
}