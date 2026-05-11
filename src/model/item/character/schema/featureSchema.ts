import { requiredString, standardInteger } from "../../../modelUtils";
import { skillChoices } from "./skillsTrainingSchema";

export const featureSchema = () => {
    const f = foundry.data.fields;
    return {
        // Name and description of this feature
        name: new f.StringField({ ...requiredString, initial: '' }),
        description: new f.StringField({ initial: '' }),

        // The level at which this feature becomes available
        level: new f.NumberField({ required: true, integer: true, min: 1, max: 10, initial: 1 }),

        // Number of points to be placed into stats (max: 7)
        statBonus: new f.NumberField({ ...standardInteger, max: 10 }),

        // Perks which are eligible to choose at this level
        perkOptions: new f.ArrayField(new f.StringField({ initial: '' }), { initial: [] }),

        // Number of perks allowed to be chose from availablePerks
        perkLimit: new f.NumberField({ ...standardInteger }),

        // The number of additional skill trainings which may be chosen at this level
        skillTraining: new f.NumberField({ ...standardInteger, max: 10 }),

        // The skills which are allowed to be trained using skillTraining value
        skillOptions: skillChoices()
    };
};