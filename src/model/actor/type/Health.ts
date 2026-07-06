import { fields, requiredInteger } from "../../common/sharedSchemas"

export const healthSchema = () => {
    return {
        current: new fields.NumberField({...requiredInteger, initial: 1, nullable: false}),
        max: new fields.NumberField({ ...requiredInteger, initial: 1 })
    }
}