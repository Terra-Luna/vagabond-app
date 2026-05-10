import ItemDataModel, { BaseItemSchema } from "../ItemDataModel.mjs"

const ancestrySchema = () => {
    const f = foundry.data.fields
    return new f.SchemaField({})
}

export type AncestrySchema = ReturnType<typeof ancestrySchema> & BaseItemSchema

export default class AncestryDataModel<T extends AncestrySchema> extends ItemDataModel<T> {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            ...ancestrySchema()
        }
    }
}