import ItemDataModel, { BaseItemSchema } from "../ItemDataModel"

const perkSchema = () => {
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