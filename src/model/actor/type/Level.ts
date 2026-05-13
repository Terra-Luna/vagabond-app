import { fields } from "../../common/sharedSchemas"
import HeroDataModel from "../HeroDataModel"

export const MAX_LEVEL = 10
export const XP_CURVE = 5 //TODO: make this a configurable system option

export const levelSchema = () => {
    return {
        current: new fields.NumberField({ integer: true, min: 0, max: MAX_LEVEL, initial: 0 }),
        xp: new fields.NumberField({ integer: true, initial: 0 }),
        xpToLevel: new fields.NumberField({ integer: true, initial: 10 })
    }
}

export type LevelSchema = ReturnType<typeof levelSchema>
export type Level = foundry.abstract.TypeDataModel<LevelSchema, any>

export function setXpToNextLevel(hero: HeroDataModel) {
    return (hero.level.current! + 1) * XP_CURVE
}