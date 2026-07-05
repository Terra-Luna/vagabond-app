import { fields } from "../../common/sharedSchemas"
import { HeroDataModel } from "../HeroDataModel"

/**
 * TODO: make these configurable system variables
 */
export const MAX_LEVEL = 10
export const XP_CURVE = 10

export const levelSchema = () => {
    return {
        current: new fields.NumberField({ integer: true, min: 0, max: MAX_LEVEL, initial: 0 }),
        xp: new fields.NumberField({ integer: true, initial: 0 }),
        xpToLevel: new fields.NumberField({ integer: true, initial: 10 })
    }
}

export function setXpToNextLevel(hero: HeroDataModel) {
    hero.level.xpToLevel = (hero.level.current! + 1) * XP_CURVE
}