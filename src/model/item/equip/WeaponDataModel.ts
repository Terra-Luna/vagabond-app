import HeroDataModel from "../../actor/HeroDataModel"
import { fields, rangeOptions } from "../../common/sharedSchemas"
import EquipmentDataModel from "./EquipmentDataModel"
import { EquipmentSchema } from "./EquipmentDataModel"

const weaponSchema = () => {
    return {
        range: new fields.StringField({ ...rangeOptions(), required: false }),
        damage1H: new fields.StringField({ required: false, initial: '1d4' }),
        damage2H: new fields.StringField({ required: false, initial: '1d4' }),
        grip: new fields.SchemaField({
            options: new fields.StringField({
                required: false, initial: '1H', choices: ['1H', '2H', 'V', 'F']
            }),
            gripState: new fields.StringField({ required: false, initial: '' })
        }),
        attackSkills: new fields.ArrayField(
            new fields.StringField({ initial: '', required: true }), { initial: ['melee'] }
        ),
        properties: new fields.ArrayField(
            new fields.StringField({ required: true, blank: false }),
            { initial: [] }
        ),
        explodeData: new fields.SchemaField({
            canExplode: new fields.BooleanField({ initial: false }),
            explodesOn: new fields.ArrayField(
                new fields.NumberField({ integer: true, initial: 0, required: false }), { initial: [] }
            )
        }),
        isCrude: new fields.BooleanField({ initial: false })
    }
}

export type WeaponSchema = ReturnType<typeof weaponSchema> & EquipmentSchema

export default class WeaponDataModel extends EquipmentDataModel<WeaponSchema> {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            ...weaponSchema()
        }
    }

    override typeName: String = "Weapon"
    override onEquip(hero: HeroDataModel) { }
    override onUse() { }
}