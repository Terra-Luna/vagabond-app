import ItemDataModel, { BaseItemSchema } from "../ItemDataModel"

const spellSchema = () => {
    const f = foundry.data.fields
    return {
        
    }
}

export type SpellSchema = ReturnType<typeof spellSchema> & BaseItemSchema

export default class SpellDataModel<T extends SpellSchema> extends ItemDataModel<T> {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            ...spellSchema()
        }
    }
}