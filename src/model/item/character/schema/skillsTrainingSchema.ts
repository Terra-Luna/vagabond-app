export const skillsTrainingSchema = () => {
    const f = foundry.data.fields
    return {
        granted: new f.ArrayField(
            new f.StringField({}), { initial: [] }
        ),
        choices: skillChoices()
    }
}

export const skillChoices = () => {
    const f = foundry.data.fields
    return new f.ArrayField(
        new f.SchemaField({
            options: new f.ArrayField(new f.StringField({}), { initial: [] }),
            count: new f.NumberField({ integer: true, initial: 0, min: 0 })
        }),
        { initial: [] }
    )
}