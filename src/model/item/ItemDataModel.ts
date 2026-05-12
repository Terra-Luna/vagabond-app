import { fields } from "../common/sharedSchemas"

const baseItemSchema = () => {
    return {
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