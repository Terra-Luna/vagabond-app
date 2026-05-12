import { fields } from "../../common/sharedSchemas"
import ItemDataModel, { BaseItemSchema } from "../ItemDataModel"
import { featureSchema } from "./schema/featureSchema"
import { spellcastingSchema } from "./schema/spellcastingSchema"

const classSchema = () => {
    return {
        spellcastingData: new fields.SchemaField({ ...spellcastingSchema() }),
        keyStats: new fields.ArrayField(new fields.StringField({}), { initial: [] }),
        features: new fields.ArrayField(new fields.SchemaField({ ...featureSchema() }))
    }
}

export type ClassSchema = ReturnType<typeof classSchema> & BaseItemSchema

export default class ClassDataModel<T extends ClassSchema> extends ItemDataModel<T> {
    static override defineSchema() {
        return {
            ...super.defineSchema(),
            ...classSchema()
        }
    }

    override async prepareDerivedData() {
        super.prepareDerivedData()
    }
}