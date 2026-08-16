import { getMaxLevel } from "../../../apps/vagabond-tools/usecase/VagabondSettingsHelper"
import { fields } from "../../common/sharedSchemas"

export const levelSchema = () => {
    const MAX_LEVEL = getMaxLevel()
    return {
        current: new fields.NumberField({ integer: true, min: 0, max: MAX_LEVEL, initial: 0 }),
        xp: new fields.NumberField({ integer: true, initial: 0 }),
        xpToLevel: new fields.NumberField({ integer: true, initial: 10 })
    }
}