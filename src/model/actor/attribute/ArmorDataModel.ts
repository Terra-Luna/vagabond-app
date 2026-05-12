import { fields, requiredInteger } from "../../../common/sharedSchemas"

const armorSchema = () => {
    return {
        rating: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        bonus: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        total: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        as: new fields.StringField({ required: false })
    }
}

export type ArmorSchema = ReturnType<typeof armorSchema>

export default class ArmorDataModel extends foundry.abstract.TypeDataModel<ArmorSchema, any> {
    static defineSchema() {
        return armorSchema()
    }
}