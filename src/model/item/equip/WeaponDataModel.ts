import { lang } from "../../../utils/lang"
import { damageTypeOptions, fields, optionalInteger, rangeOptions, requiredInteger, requiredString } from "../../common/sharedSchemas"
import { EquipmentDataModel } from "./EquipmentDataModel"
import { EquipmentSchema } from "./EquipmentDataModel"

const weaponSchema = () => {
    return {
        range: new fields.StringField({ ...rangeOptions(), required: false }),
        damage: new fields.SchemaField({
            dieSize: new fields.NumberField({ ...requiredInteger, initial: 4, min: 1, max: 20 }),
            modifier: new fields.NumberField({ ...requiredInteger, initial: 0 }),
            type: new fields.StringField({ ...damageTypeOptions() })
        }),
        grip: new fields.SchemaField({
            style: new fields.StringField({ ...requiredString, choices: Object.keys(lang.VGLITE.Grips), initial: 'H' }),
            state: new fields.StringField({ ...requiredString, choices: Object.keys(lang.VGLITE.Grips), initial: 'H' })
        }),
        weaponTypes: new fields.ArrayField(
            new fields.StringField({
                ...requiredString, choices: Object.keys(lang.VGLITE.WeaponTypes)
            }),
            { initial: [] }
        ),
        properties: new fields.ArrayField(
            new fields.StringField({
                ...requiredString, choices: Object.keys(lang.VGLITE.WeaponProps)
            }),
            { initial: [] }
        ),
        explodeData: new fields.SchemaField({
            canExplode: new fields.BooleanField({ initial: false }),
            explodesOn: new fields.ArrayField(
                new fields.NumberField({ integer: true, initial: 0, required: false }),
                { initial: [] }
            )
        }),
        material: new fields.StringField({
            ...requiredString, initial: 'standard', choices: Object.keys(lang.VGLITE.Metals)
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
    const die = w.grip.style === 'V' && w.grip.state === 'HH' ? w.damage.dieSize + 2 : w.damage.dieSize
    const mod = w.damage.modifier
    return `1d${die}${mod > 0 ? `+${mod}` : ''}`
}

export const isEquippedWeapon = (item: any): boolean => {
    return item.parent.type === 'weapon' && item.isEquipped
}