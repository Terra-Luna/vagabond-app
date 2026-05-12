import { fields } from "../../../common/sharedSchemas"

export const skillsTrainingSchema = () => {
    return {
        granted: new fields.ArrayField(
            new fields.StringField({}), { initial: [] }
        ),
        choices: skillChoices()
    }
}

export const skillChoices = () => {
    return new fields.ArrayField(
        new fields.SchemaField({
            options: new fields.ArrayField(new fields.StringField({}), { initial: [] }),
            count: new fields.NumberField({ integer: true, initial: 0, min: 0 })
        }),
        { initial: [] }
    )
}