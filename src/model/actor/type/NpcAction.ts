import { DiceRollSchema } from "../../../apps/attack-builder/model/DieRollSchema"
import { appLang } from "../../../utils/lang"
import { damageTypeOptions, fields, optionalString, requiredInteger, requiredString, savingThrowOptions, statusEffOptions } from "../../common/sharedSchemas"

/**
 * A detailed adversary offensive action.
 */
export const npcActionSchema = () => {
    return {
        name: new fields.StringField({ required: true }),
        description: new fields.StringField({ ...optionalString }),
        type: new fields.StringField({ ...requiredString, choices: Object.keys(appLang.NpcSheet.actionTypes), initial: "melee" }),
        range: new fields.StringField({ ...requiredString, choices: Object.keys(appLang.Ranges), initial: "close" }),
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
        // Saving throws a targeted player may choose from to resist this action.
        saves: new fields.ArrayField(
            new fields.StringField({ ...savingThrowOptions() }),
            { initial: [] }
        ),
        // Targets take half damage if save succeeds.
        halfDamageOnSave: new fields.BooleanField({ initial: false }),
        // Status effects applied if target fails save and takes damage.
        appliedEffects: new fields.ArrayField(
            new fields.SchemaField({
                effect: new fields.StringField({ ...requiredString, choices: Object.keys(appLang.StatusConditions) }),
                duration: new fields.StringField({ ...optionalString })
            }),
            { initial: [] }
        ),
        statuses: new fields.ArrayField(
            new fields.StringField({ ...statusEffOptions() }),
            { initial: [] }
        ),
        recharge: new fields.StringField({ ...optionalString })
    }
}

export const getDamageAverage = (dice: DiceRollSchema): number => {
    return Math.floor((dice.faces + 1) * dice.count / 2) + (dice.modifier ?? 0)
}

/**
 * Special NPC combo actions. E.g.: "Combo: 2x Claw & 1x Bite".
 */
export const npcActionComboSchema = () => {
    return {
        name: new fields.StringField({ ...requiredString }),
        description: new fields.StringField({ ...optionalString }),
        actions: new fields.ArrayField(
            new fields.SchemaField({
                ...npcActionSchema(),
                comboCount: new fields.NumberField({ ...requiredInteger })
            }))
    }
}