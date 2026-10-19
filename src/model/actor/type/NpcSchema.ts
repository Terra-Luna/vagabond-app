import { appLang } from "../../../utils/lang"
import { fields, optionalString, requiredInteger, requiredString, zonePreferences } from "../../common/sharedSchemas"
import { BaseActorSchema } from "../ActorDataModel"
import { npcActionComboSchema,npcActionSchema } from "./NpcAction"

export const npcSchema = () => {
    return {
        beingSize: new fields.StringField({ ...requiredString, initial: 'medium', choices: Object.keys(appLang.Sizes) }),
        beingType: new fields.StringField({ ...requiredString, initial: 'humanlike', choices: Object.keys(appLang.BeingTypes) }),
        beingSubtype: new fields.StringField({ ...optionalString, initial: 'none', choices: Object.keys(appLang.BeingSubtypes) }),
        threatLevel: new fields.NumberField({ integer: false, min: 0, initial: 1.0, decimal: true }),
        threatLevelOverride: new fields.NumberField({ integer: false, min: 0, initial: null, decimal: true }),
        description: new fields.HTMLField(),
        hitDice: new fields.NumberField({ required: true, integer: true, min: 1, initial: 1 }),
        zone: new fields.StringField({ ...zonePreferences() }),
        speeds: new fields.ArrayField(
            new fields.SchemaField({
                value: new fields.NumberField({ ...requiredInteger, initial: 25 }),
                type: new fields.StringField({ ...requiredString, initial: "walk", choices: Object.keys(appLang.Movement) })
            }), { initial: [{ value: 30, type: "walk" }] }
        ),
        morale: new fields.NumberField({ integer: true, min: 1, max: 12 }),
        numberAppearing: new fields.StringField({ initial: 'd4' }),

        actions: new fields.ArrayField(new fields.SchemaField({ ...npcActionSchema() }), { initial: [] }),
        combo: new fields.SchemaField({ ...npcActionComboSchema() })
    }
}

export type NpcSchema = ReturnType<typeof npcSchema> & BaseActorSchema