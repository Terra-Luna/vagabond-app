import { fields, requiredInteger } from "../../common/sharedSchemas"

export const healthSchema = () => {
    return {
        value: new fields.NumberField({ ...requiredInteger, initial: 4, nullable: false }),
        max: new fields.NumberField({ ...requiredInteger, initial: 0 })
    }
}