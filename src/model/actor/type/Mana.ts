import { fields, requiredInteger } from "../../common/sharedSchemas"

export const manaSchema = () => {
    return {
        max: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        current: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        maxCast: new fields.NumberField({ integer: true, initial: 0 }),
        spellDamageDie: new fields.NumberField({ ...requiredInteger, initial: 6 })
    }
}