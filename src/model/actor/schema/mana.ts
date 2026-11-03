import { fields, requiredInteger } from "../../common/shared-schemas"

export const manaSchema = () => {
  return {
    max: new fields.NumberField({ ...requiredInteger, initial: 0 }),
    value: new fields.NumberField({ ...requiredInteger, initial: 0 }),
    maxCast: new fields.NumberField({ ...requiredInteger, initial: 0 }),
  }
}
