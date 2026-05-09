const baseItemSchema = () => {
    const f = foundry.data.fields
    return {
        description: new f.HTMLField()
    }
}

export type BaseItemSchema = ReturnType<typeof baseItemSchema>

export default abstract class ItemBase extends foundry.abstract.TypeDataModel<BaseItemSchema, any> {
    static defineSchema() {
        return baseItemSchema()
    }
}