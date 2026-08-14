import { requiredInteger } from "../../common/sharedSchemas"

export const statusFxSchema = () => {
    const fields = foundry.data.fields

    return {
        // Flat boolean tracking flags for simple conditions
        toggles: new fields.SchemaField({
            berserk: new fields.BooleanField({ initial: false }),
            blinded: new fields.BooleanField({ initial: false }),
            charmed: new fields.BooleanField({ initial: false }),
            confused: new fields.BooleanField({ initial: false }),
            dazed: new fields.BooleanField({ initial: false }),
            dead: new fields.BooleanField({ initial: false }),
            frightened: new fields.BooleanField({ initial: false }),
            incapacitated: new fields.BooleanField({ initial: false }),
            invisible: new fields.BooleanField({ initial: false }),
            paralyzed: new fields.BooleanField({ initial: false }),
            prone: new fields.BooleanField({ initial: false }),
            restrained: new fields.BooleanField({ initial: false }),
            sickened: new fields.BooleanField({ initial: false }),
            suffocating: new fields.BooleanField({ initial: false }),
            unconscious: new fields.BooleanField({ initial: false }),
            vulnerable: new fields.BooleanField({ initial: false })
        }),

        stacks: new fields.SchemaField({
            burning: new fields.ArrayField(
                new fields.SchemaField({
                    effectId: new fields.StringField({ required: true }),
                    duration: new fields.StringField({ initial: "Cd4" }),
                    sourceUuid: new fields.StringField()
                }),
                { initial: [] }
            )
        }),

        counters: new fields.SchemaField({
            luck: new fields.NumberField({ ...requiredInteger, initial: 0 }),
            studied: new fields.NumberField({ ...requiredInteger, initial: 0 }),
            focus: new fields.NumberField({ ...requiredInteger, initial: 0 }),
            fatigue: new fields.NumberField({ ...requiredInteger, initial: 0, max: 5 })
        })

    }
}