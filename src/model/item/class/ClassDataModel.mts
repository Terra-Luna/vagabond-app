import ItemDataModel, { BaseItemSchema } from "../ItemDataModel.mjs"
import { featuresSchema } from "./schema/FeaturesSchema.mjs"
import { skillsTrainingSchema } from "./schema/SkillsTrainingSchema.mjs"
import { spellcastingSchema } from "./schema/SpellcastingSchema.mjs"
import { spellsProgressionSchema } from "./schema/SpellsProgressionSchema.mjs"

const classSchema = () => {
    const f = foundry.data.fields
    return new f.SchemaField({
        spellcasting: spellcastingSchema(),
        keyStats: new f.ArrayField(new f.StringField(), { initial: [] }),
        skillsTraining: skillsTrainingSchema(),
        features: featuresSchema(),
        spellsProgression: spellsProgressionSchema()
    })
}

export type ClassSchema = ReturnType<typeof classSchema> & BaseItemSchema

export default class ClassDataModel<T extends ClassSchema> extends ItemDataModel<T> {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            ...classSchema()
        }
    }
}