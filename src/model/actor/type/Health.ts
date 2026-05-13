import { fields, requiredInteger } from "../../common/sharedSchemas"

export const healthSchema = () => {
    return {
        current: new fields.NumberField({ ...requiredInteger, initial: 1 }),
        max: new fields.NumberField({ ...requiredInteger, initial: 1 }),
        // BONUS to the MAX!!!
        bonus: new fields.NumberField({ required: true, integer: true, initial: 0 })
    }
}

export type HealthSchema = ReturnType<typeof healthSchema>
export type Health = foundry.abstract.TypeDataModel<HealthSchema, any>