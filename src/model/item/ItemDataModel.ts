import { fields, requiredString } from "../common/sharedSchemas"

const baseItemSchema = () => {
    return {
        name: new fields.StringField({ ...requiredString }),
        description: new fields.HTMLField()
    }
}

export type BaseItemSchema = ReturnType<typeof baseItemSchema>

export default abstract class ItemDataModel<T extends BaseItemSchema> extends foundry.abstract.TypeDataModel<T, any> {
    static defineSchema() {
        return {
            ...baseItemSchema()
        }
    }
}