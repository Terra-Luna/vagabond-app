const baseItemSchema = () => {
    const f = foundry.data.fields
    return {
        description: new f.HTMLField()
    }
}

export type BaseItemSchema = ReturnType<typeof baseItemSchema>

export default abstract class ItemDataModel<T extends BaseItemSchema> extends foundry.abstract.TypeDataModel<T, any> {
    static defineSchema() {
        return baseItemSchema()
    }
}