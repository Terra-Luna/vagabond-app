const baseActorSchema = (extras, { maxHealth, startingHealth }: { maxHealth: number, startingHealth: number }) => {
    const f = foundry.data.fields

    const schema = {
        resources: new f.SchemaField({
            health: new f.SchemaField({
                max: new f.NumberField({ required: true, integer: true, min: 0, initial: maxHealth }),
                value: new f.NumberField({ required: true, number: true, min: 0, initial: startingHealth })
            }),
            ...extras
        }),
        movement: new f.ArrayField(
            new f.SchemaField({
                speed: new f.NumberField({ integer: true, min: 0 }),
                type: new f.StringField({
                    choices: ['walk', 'fly', 'cling', 'climb', 'phase', 'swim']
                })
            })
        ),
        size: new f.StringField({
            choices: ['small', 'medium', 'large', 'huge', 'giant', 'colossal'],
            initital: 'medium'
        }),
        beingType: new f.StringField({
            choices: ['artificial', 'beast', 'cryptid', 'fae', 'humanlike', 'outer', 'primordial', 'undead'],
            initial: 'humanlike'
        }),
        senses: new f.SchemaField({
            allsight: new f.BooleanField({ initial: false }),
            blindsight: new f.BooleanField({ initial: false }),
            darksight: new f.BooleanField({ initial: false }),
            echolocation: new f.BooleanField({ initial: false }),
            seismicsense: new f.BooleanField({ initial: false }),
            telepathy: new f.BooleanField({ initial: false })
        })
    }

    // a hack to get the typing system on our side
    schema.resources.fields = {
        ...schema.resources.fields,
        ...extras
    }

    return schema
}

export type BaseActorModelSchema = ReturnType<typeof baseActorSchema>

export default abstract class BaseActor extends foundry.abstract.TypeDataModel<BaseActorModelSchema, any> {
    static defineSchema(extras = {}, props = { maxHealth: 2, startingHealth: 2 }) {
        return baseActorSchema(extras, props)
    }
}