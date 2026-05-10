import ItemDataModel, { BaseItemSchema } from "../ItemDataModel.mjs"

const perkSchema = () => {
    const f = foundry.data.fields
    return {
        
    }
}

export type PerkSchema = ReturnType<typeof perkSchema> & BaseItemSchema

export default class PerkDataModel<T extends PerkSchema> extends ItemDataModel<T> {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            ...perkSchema()
        }
    }
}