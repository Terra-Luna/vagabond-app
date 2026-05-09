import { HeroDataModel } from "../../actor/Hero.mjs"
import Equipment, { EquipmentSchema } from "./EquipmentDataModel.mjs"

const weaponSchema = () => {
    const f = foundry.data.fields
    return {
        range: new f.StringField({
            required: false, initial: 'close', choices: ['close', 'near', 'far']
        }),
        damage1H: new f.StringField({ required: false, initial: '' }),
        damage2H: new f.StringField({ required: false, initial: '' }),
        grip: new f.SchemaField({
            options: new f.StringField({
                required: false, initial: '1H', choices: ['1H', '2H', 'V', 'F']
            }),
            gripState: new f.StringField({ required: false, initial: '' })
        }),
        attackSkills: new f.ArrayField(
            new f.StringField({ initial: '', required: true }), { initial: [] }
        ),
        properties: new f.ArrayField(
            new f.StringField({ required: true, blank: false }),
            { initial: [] }
        ),
        explodeData: new f.SchemaField({
            canExplode: new f.BooleanField({ initial: false }),
            explodesOn: new f.ArrayField(
                new f.NumberField({ integer: true, initial: 0, required: false }), { initial: [] }
            )
        }),
        isCrude: new f.BooleanField({ initial: false })
    }
}

export type WeaponSchema = ReturnType<typeof weaponSchema> & EquipmentSchema

export class WeaponDataModel extends foundry.abstract.TypeDataModel<WeaponSchema, any> {
    static defineSchema() {
        const f = foundry.data.fields
        return {
            ...super.defineSchema(),
            ...weaponSchema()
        }
    }

    onEquip(hero: HeroDataModel) {
        
    }

    onUse() { }
}