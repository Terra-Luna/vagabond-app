import { fields, requiredInteger } from "../../common/shared-schemas"

export const armorSchema = () => {
  return {
    rating: new fields.NumberField({ ...requiredInteger, initial: 0 }),
  }
}
