import { fields, requiredInteger } from "../../common/sharedSchemas"
import HeroDataModel, { Hero } from "../HeroDataModel"

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

export function calculateMaxHP(hero: HeroDataModel) {
    hero.health.max = hero.stats.might! * (hero.level.current || 1) + hero.health.bonus!
}