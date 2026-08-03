import { lang } from "../../../utils/lang"
import { damageTypeOptions, fields, rangeOptions, requiredInteger, requiredString } from "../../common/sharedSchemas"
import { EquipmentDataModel } from "./EquipmentDataModel"
import { EquipmentSchema } from "./EquipmentDataModel"

const weaponSchema = () => {
    return {
        range: new fields.StringField({ ...rangeOptions(), required: false }),
        damage: new fields.SchemaField({
            dice: new fields.SchemaField({
                count: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
                faces: new fields.NumberField({ ...requiredInteger, initial: 4, min: 1, max: 20 }),
                modifier: new fields.NumberField({ ...requiredInteger, initial: 0 }),
                explodesOn: new fields.ArrayField(
                    new fields.NumberField({ integer: true, initial: 0, required: false }),
                    { initial: [] }
                )
            }),
            type: new fields.StringField({ ...damageTypeOptions() })
        }),
        grip: new fields.SchemaField({
            style: new fields.StringField({ ...requiredString, choices: Object.keys(lang.VGLITE.Grips), initial: 'H' }),
            state: new fields.StringField({ ...requiredString, choices: Object.keys(lang.VGLITE.Grips), initial: 'H' })
        }),
        skills: new fields.ArrayField(
            new fields.StringField({
                ...requiredString, choices: Object.keys(lang.VGLITE.WeaponSkills)
            }),
            { initial: [] }
        ),
        properties: new fields.ArrayField(
            new fields.StringField({
                ...requiredString, choices: Object.keys(lang.VGLITE.WeaponProps)
            }),
            { initial: [] }
        ),
        material: new fields.StringField({
            ...requiredString, initial: 'steel', choices: Object.keys(lang.VGLITE.Metals)
        })
    }
}

export type WeaponSchema = ReturnType<typeof weaponSchema> & EquipmentSchema

export class WeaponDataModel extends EquipmentDataModel<WeaponSchema> {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            ...weaponSchema()
        }
    }

    override async _onCreate(data: any, options: any, userId: string) {
        super._onCreate(data, options, userId)
        this.parent.update({
            'system.category': 'weapons'
        })
    }

    override prepareBaseData() {
        super.prepareBaseData()
        this.isEquippable = true
        this.isConsumable = false
        this.bulk.isStackable = false
    }
}

export const gripStateDamage = (w: WeaponDataModel): string => {
    const die = w.grip.style === 'V' && w.grip.state === 'HH' ? w.damage.dice.faces + 2 : w.damage.dice.faces
    const mod = w.damage.dice.modifier
    return `1d${die}${mod > 0 ? `+${mod}` : ''}`
}

export const isEquippedWeapon = (item: any): boolean => {
    return item.parent.type === 'weapon' && item.isEquipped
}