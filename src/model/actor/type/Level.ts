import { fields } from "../../common/sharedSchemas"

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

export function xpToNextLevel(currentLevel: number): number {
    return (currentLevel + 1) * XP_CURVE
}