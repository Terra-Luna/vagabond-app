import ItemDataModel, { BaseItemSchema } from "../ItemDataModel"
import { featureSchema } from "./schema/featureSchema"
import { skillsTrainingSchema } from "./schema/skillsTrainingSchema"
import { spellcastingSchema } from "./schema/spellcastingSchema"

const classSchema = () => {
    const f = foundry.data.fields
    return {
        spellcasting: new f.SchemaField({ ...spellcastingSchema() }),
        keyStats: new f.ArrayField(new f.StringField({}), { initial: [] }),
        skillsTraining: new f.SchemaField({ ...skillsTrainingSchema() }),
        features: new f.ArrayField(new f.SchemaField({ ...featureSchema() }))
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

    override async prepareDerivedData() {
        super.prepareDerivedData()
    }
}