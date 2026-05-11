import ItemDataModel, { BaseItemSchema } from "../ItemDataModel"

const ancestrySchema = () => {
    return {
        
    }
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