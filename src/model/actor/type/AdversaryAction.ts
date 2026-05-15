import { fields, rangeOptions, requiredInteger } from "../../common/sharedSchemas"
import WeaponDataModel from "../../item/equip/WeaponDataModel"

/**
 * A detailed adversary offensive action.
 */
export const adversaryActionSchema = () => {
    return {
        name: new fields.StringField({ required: true, initial: '' }),
        weapon: new fields.SchemaField({ ...WeaponDataModel.defineSchema() }),
        damage: new fields.SchemaField({ roll: new fields.StringField({ required: true, initial: '1d4' }), avg: new fields.NumberField({ ...requiredInteger, initial: 2 }) }),
        range: new fields.StringField({ ...rangeOptions(), required: false }),
        area: new fields.StringField({ required: false }),
        save: new fields.StringField({ required: false }),
        effect: new fields.StringField({ required: false }),
        usage: new fields.SchemaField({ uses: new fields.StringField({ required: false }), requiresFocus: new fields.BooleanField({ initial: false }) })
    }
}

/**
 * Special NPC combo actions. E.g.: "Combo: 2x Claw & 1x Bite".
 */
export const adversaryActionComboSchema = () => {
    return {
        actions: new fields.ArrayField(new fields.SchemaField({ ...adversaryActionSchema() }))
    }
}