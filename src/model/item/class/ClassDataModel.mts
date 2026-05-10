import ItemDataModel, { BaseItemSchema } from "../ItemDataModel.mjs"

const classSchema = () => {
    const f = foundry.data.fields
    return {
        
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