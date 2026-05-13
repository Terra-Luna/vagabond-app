import { skillSchema } from "../../../actor/type/Skills"
import { fields, requiredInteger, standardInteger } from "../../../common/sharedSchemas"

export const skillsTrainingSchema = () => {
    return {
        // Skills they get at character creation
        innate: new fields.ArrayField(new fields.SchemaField({ ...skillSchema() })),
        // Extra pool of skills they get to choose to train
        trainingOptions: new fields.ArrayField(new fields.SchemaField({ ...skillSchema() })),
        // How many skills they get to train from the 'options' pool
        trainings: new fields.NumberField({ ...standardInteger }),
        // How many skills they may train from the whole list
        unrestrictedTrainings: new fields.NumberField({ ...standardInteger })
    }
}

export type SkillsTrainingSchema = ReturnType<typeof skillsTrainingSchema>
export type SkillsTraining = foundry.abstract.TypeDataModel<SkillsTrainingSchema, any>