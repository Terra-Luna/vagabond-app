import { DiceRollSchema } from "../../../combat/engine/roll/DiceRoll"
import { damageTypeOptions, fields, optionalString, requiredInteger, requiredString } from "../../common/sharedSchemas"

/**
 * A detailed adversary offensive action.
 */
export const adversaryActionSchema = () => {
    return {
        name: new fields.StringField({ required: true }),
        effect: new fields.StringField({ ...optionalString }),
        damage: new fields.SchemaField({
            dice: new fields.SchemaField({
                count: new fields.NumberField({ ...requiredInteger, initial: 1, min: 0 }),
                faces: new fields.NumberField({ ...requiredInteger, initial: 4, min: 0, max: 20 }),
                modifier: new fields.NumberField({ ...requiredInteger, initial: 0 }),
                explodesOn: new fields.ArrayField(
                    new fields.NumberField({ integer: true, initial: 0, required: false }),
                    { initial: [] }
                )
            }),
            type: new fields.StringField({ ...damageTypeOptions() })
        }),
        recharge: new fields.StringField({ ...optionalString })
    }
}

export const getDamageAverage = (dice: DiceRollSchema): number => {
    return Math.ceil((dice.faces + 1) * dice.count / 2) + (dice.modifier ?? 0)
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