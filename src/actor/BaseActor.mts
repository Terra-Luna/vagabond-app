const baseActorSchema = (additionalResources, { maxHealth, startingHealth }: { maxHealth: number; startingHealth: number }) => {
    const fields = foundry.data.fields;

    return {
        resources: new fields.SchemaField({
            health: new fields.SchemaField({
                max: new fields.NumberField({ required: true, integer: true, min: 0, initial: maxHealth }),
                value: new fields.NumberField({ required: true, number: true, min: 0, initial: startingHealth })
            }),
            ...additionalResources
        }),
        movement: new fields.ArrayField(
            new fields.SchemaField({
                speed: new fields.NumberField({ integer: true, min: 0 }),
                type: new fields.StringField({ choices: ['walk', 'fly', 'cling', 'climb', 'phase', 'swim'] })
            })),
        size: new fields.StringField({
            choices: ['small', 'medium', 'large', 'huge', 'giant', 'colossal']
        }),
        beingType: new fields.StringField({
            choices: ['artificial', 'beast', 'cryptid', 'fae', 'humanlike',
                'outer', 'primordial', 'undead']
        }),
        senses: new fields.SchemaField({
            allsight: new fields.BooleanField(),
            blindsight: new fields.BooleanField(),
            darksight: new fields.BooleanField(),
            echolocation: new fields.BooleanField(),
            seismicsense: new fields.BooleanField(),
            telepathy: new fields.BooleanField()
        }),
        // todo: weaknesses (might be adversary-only)
    }
}

export type BaseActorModelSchema = ReturnType<typeof baseActorSchema>

export default class BaseActor extends foundry.abstract.TypeDataModel<BaseActorModelSchema, any> {
    static defineSchema(additionalResources = {}, props = { maxHealth: 2, startingHealth: 2 }) {
        return baseActorSchema(additionalResources, props)
    }

    async prepareDerivedData() {
    }
}