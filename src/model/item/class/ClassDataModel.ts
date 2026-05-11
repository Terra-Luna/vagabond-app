import ItemDataModel, { BaseItemSchema } from "../ItemDataModel"
import { featureSchema } from "./schema/FeaturesSchema"
import { skillsTrainingSchema } from "./schema/SkillsTrainingSchema"
import { spellcastingSchema } from "./schema/SpellcastingSchema"
import { spellsProgressionSchema } from "./schema/SpellsProgressionSchema"

const classSchema = () => {
    const f = foundry.data.fields
    return {
        spellcasting: new f.SchemaField({ ...spellcastingSchema() }),
        keyStats: new f.ArrayField(new f.StringField({}), { initial: [] }),
        skillsTraining: new f.SchemaField({ ...skillsTrainingSchema() }),
        features: new f.ArrayField(new f.SchemaField({ ...featureSchema() })),
        spellsProgression: new f.SchemaField({ ...spellsProgressionSchema() })
    }
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