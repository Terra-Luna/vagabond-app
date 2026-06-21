import { damageTypeOptions, fields, optionalString, rangeOptions, requiredInteger, requiredString } from "../../common/sharedSchemas"
import WeaponDataModel from "../../item/equip/WeaponDataModel"

/**
 * A detailed adversary offensive action.
 */
export const adversaryActionSchema = () => {
    return {
        name: new fields.StringField({ required: true, initial: 'Claws [Melee Attack]' }),
        effect: new fields.HTMLField(),
        damage: new fields.SchemaField({
            roll: new fields.StringField({ required: true, initial: '1d4' }),
            avg: new fields.NumberField({ ...requiredInteger, initial: 2 }),
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
        actions: new fields.ArrayField(new fields.SchemaField({ ...adversaryActionSchema() }))
    }
}