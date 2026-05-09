const baseActorSchema = () => {
    const f = foundry.data.fields
    const schema = {
        health: new f.SchemaField({
            value: new f.NumberField({ required: true, number: true, min: 0, initial: 2 }),
            max: new f.NumberField({ required: true, integer: true, min: 0, initial: 2 }),
            maxBonus: new f.NumberField({ required: false, integer: true, min: 0, initial: 0 })
        }),
        armor: new f.SchemaField({
            rating: new f.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
            bonus: new f.NumberField({ required: false, integer: true, min: 0, initial: 0 }),
            total: new f.NumberField({ required: true, integer: true, min: 0, initial: 0 })
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

    return schema
}

export type BaseActorSchema = ReturnType<typeof baseActorSchema>

export default abstract class ActorBase extends foundry.abstract.TypeDataModel<BaseActorSchema, any> {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            ...baseActorSchema()
        }
    }
}