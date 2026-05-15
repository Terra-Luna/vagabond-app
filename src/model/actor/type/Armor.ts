import { fields, requiredInteger } from "../../common/sharedSchemas"

export const armorSchema = () => {
    return {
        rating: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        total: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        as: new fields.StringField({ required: false })
    }
}

export type ArmorSchema = ReturnType<typeof armorSchema>
export type Armor = foundry.abstract.TypeDataModel<ArmorSchema, any>