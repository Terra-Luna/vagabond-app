import { appLang } from "../../../utils/lang"
import { damageTypeOptions, fields, optionalString, requiredString, statusEffOptions, zonePreferences } from "../../common/sharedSchemas"
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
        movement: new fields.SchemaField({
            speed: new fields.StringField({ ...requiredString, initial: "30'" })
        }),
        morale: new fields.NumberField({ integer: true, min: 1, max: 12 }),
        numberAppearing: new fields.StringField({ initial: 'd4' }),

        dmgImmunities: new fields.ArrayField(new fields.StringField({ ...damageTypeOptions() })),
        dmgWeaknesses: new fields.ArrayField(new fields.StringField({ ...damageTypeOptions() })),
        statusImmunities: new fields.ArrayField(new fields.StringField({ ...statusEffOptions() })),

        actions: new fields.ArrayField(new fields.SchemaField({ ...npcActionSchema() }), { initial: [] }),
        combo: new fields.SchemaField({ ...npcActionComboSchema() })
    }
}

export type NpcSchema = ReturnType<typeof npcSchema> & BaseActorSchema