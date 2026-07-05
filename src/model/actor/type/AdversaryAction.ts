import { damageTypeOptions, fields, optionalInteger, optionalString, rangeOptions, requiredInteger, requiredString } from "../../common/sharedSchemas"
import { WeaponDataModel } from "../../item/equip/WeaponDataModel"

/**
 * A detailed adversary offensive action.
 */
export const adversaryActionSchema = () => {
    return {
        name: new fields.StringField({ required: true }),
        effect: new fields.StringField({ ...optionalString }),
        damage: new fields.SchemaField({
            roll: new fields.StringField({ ...optionalString }),
            avg: new fields.NumberField({ ...optionalInteger }),
            type: new fields.StringField({ ...damageTypeOptions() })
        }),
        recharge: new fields.StringField({ ...optionalString })
    }
}

/**
 * Special NPC combo actions. E.g.: "Combo: 2x Claw & 1x Bite".
 */
export const adversaryActionComboSchema = () => {
    return {
        name: new fields.StringField({ ...requiredString }),
        actions: new fields.ArrayField(
            new fields.SchemaField({
                ...adversaryActionSchema(),
                comboCount: new fields.NumberField({ ...requiredInteger })
            }))
    }
}