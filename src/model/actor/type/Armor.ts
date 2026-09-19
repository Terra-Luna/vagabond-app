import { fields, requiredInteger } from "../../common/sharedSchemas"

export const armorSchema = () => {
    return {
        rating: new fields.NumberField({ ...requiredInteger, initial: 0 })
    }
}