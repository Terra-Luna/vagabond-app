import { lang } from "../../../utils/lang"
import { damageTypeOptions, fields, rangeOptions, requiredString } from "../../common/sharedSchemas"
import { EquipmentDataModel } from "./EquipmentDataModel"
import { EquipmentSchema } from "./EquipmentDataModel"

const weaponSchema = () => {
    return {
        range: new fields.StringField({ ...rangeOptions(), required: false }),
        damage: new fields.SchemaField({
            oneHand: new fields.StringField({ required: false, initial: '1d4' }),
            twoHand: new fields.StringField({ required: false, initial: '1d4' }),
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

    override async prepareBaseData() {
        super.prepareBaseData()
        this.isEquippable = true
        this.isConsumable = false
        this.bulk.isStackable = false
    }
}

export const gripStateDamage = (w: WeaponDataModel): string => {
    return w.grip.state === 'HH' ? w.damage.twoHand : w.damage.oneHand
}

export const isEquippedWWeapon = (item: any): boolean => {
    return item.parent.type === 'weapon' && item.isEquipped
}