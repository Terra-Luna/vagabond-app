import { fields } from "../common/sharedSchemas"

const baseItemSchema = () => {
    return {
        description: new fields.HTMLField(),
        rules: new fields.ArrayField(new fields.ObjectField({ required: true }))
    }
}

export type BaseItemSchema = ReturnType<typeof baseItemSchema>

export abstract class ItemDataModel<T extends BaseItemSchema> extends foundry.abstract.TypeDataModel<T, any> {
    static defineSchema() {
        return {
            ...baseItemSchema()
        }
    }
}