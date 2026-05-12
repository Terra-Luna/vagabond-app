import { fields, requiredString, standardInteger } from "../../../common/sharedSchemas"
import { skillChoices } from "./skillsTrainingSchema"

export const featureSchema = () => {
    return {
        // Name and description of this feature
        name: new fields.StringField({ ...requiredString, initial: '' }),
        description: new fields.StringField({ initial: '' }),

        // The level at which this feature becomes available
        level: new fields.NumberField({ required: true, integer: true, min: 1, max: 10, initial: 1 }),

        // Number of points to be placed into stats
        statBonus: new fields.NumberField({ ...standardInteger, max: 10 }),

        // Perks which are eligible to choose at this level
        perkOptions: new fields.ArrayField(new fields.StringField({ initial: '' }), { initial: [] }),

        // Number of perks allowed to be chose from availablePerks
        perkLimit: new fields.NumberField({ ...standardInteger }),

        // The number of additional skill trainings which may be chosen at this level
        skillTraining: new fields.NumberField({ ...standardInteger, max: 10 }),

        // The skills which are allowed to be trained using skillTraining value
        skillOptions: skillChoices()
    }
}