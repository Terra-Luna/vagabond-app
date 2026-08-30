import { lang } from "../../../utils/lang"
import { damageTypeOptions, fields, movementTypes, optionalString, requiredString, statusEffOptions,zonePreferences } from "../../common/sharedSchemas"
import { BaseActorSchema } from "../ActorDataModel"
import { npcActionComboSchema,npcActionSchema } from "./NpcAction"

export const npcSchema = () => {
    return {
        beingSize: new fields.StringField({ ...requiredString, initial: 'medium', choices: Object.keys(lang.VGLITE.Sizes) }),
        beingType: new fields.StringField({ ...requiredString, initial: 'humanlike', choices: Object.keys(lang.VGLITE.BeingTypes) }),
        beingSubtype: new fields.StringField({ ...optionalString, initial: 'none', choices: Object.keys(lang.VGLITE.BeingSubtypes) }),
        threatLevel: new fields.NumberField({ integer: false, min: 0, initial: 1.00 }),
        threatLevelOverride: new fields.NumberField({ integer: false, min: 0, initial: null }),
        description: new fields.HTMLField(),
        hitDice: new fields.NumberField({ required: true, integer: true, min: 1, initial: 1 }),
        zone: new fields.StringField({ ...zonePreferences() }),
        movement: new fields.SchemaField({
            speed: new fields.NumberField({ integer: true, min: 0 }),
            type: new fields.StringField({ ...movementTypes() })
        }),
        morale: new fields.NumberField({ integer: true, min: 2, max: 12 }),
        numberAppearing: new fields.StringField({ initial: '1d4' }),

        dmgImmunities: new fields.ArrayField(new fields.StringField({ ...damageTypeOptions() })),
        dmgWeaknesses: new fields.ArrayField(new fields.StringField({ ...damageTypeOptions() })),
        statusImmunities: new fields.ArrayField(new fields.StringField({ ...statusEffOptions() })),

        actions: new fields.ArrayField(new fields.SchemaField({ ...npcActionSchema() }), { initial: [] }),
        combo: new fields.SchemaField({ ...npcActionComboSchema() }),
        abilities: new fields.ArrayField(
            new fields.SchemaField({
                name: new fields.StringField({ required: true, initial: '' }),
                description: new fields.HTMLField({ required: true, initital: '' })
            })
        )
    }
}

export type NpcSchema = ReturnType<typeof npcSchema> & BaseActorSchema