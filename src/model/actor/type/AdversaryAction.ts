import { damageTypeOptions, fields, optionalString, rangeOptions, requiredInteger, requiredString } from "../../common/sharedSchemas"
import WeaponDataModel from "../../item/equip/WeaponDataModel"

/**
 * A detailed adversary offensive action.
 */
export const adversaryActionSchema = () => {
    return {
        name: new fields.StringField({ required: true }),
        effect: new fields.HTMLField(),
        damage: new fields.SchemaField({
            roll: new fields.StringField({ required: true }),
            avg: new fields.NumberField({ ...requiredInteger }),
            type: new fields.StringField({ ...damageTypeOptions() })
        }),
        recharge: new fields.StringField({ ...optionalString }),
        comboCount: new fields.NumberField({ ...requiredInteger, initial: 0 })
    }
}

/**
 * Special NPC combo actions. E.g.: "Combo: 2x Claw & 1x Bite".
 */
export const adversaryActionComboSchema = () => {
    return {
        name: new fields.StringField({ ...requiredString }),
        actions: new fields.ArrayField(new fields.SchemaField({ ...adversaryActionSchema() }))
    }
}