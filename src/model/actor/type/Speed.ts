import { fields, requiredInteger } from "../../common/sharedSchemas"
import HeroDataModel from "../HeroDataModel"

export const speedSchema = () => {
    return {
        turn: new fields.NumberField({ ...requiredInteger, initial: 25 }),
        crawl: new fields.NumberField({ ...requiredInteger, initial: 75 }),
        travel: new fields.NumberField({ ...requiredInteger, initial: 5 }),
        bonus: new fields.NumberField({ ...requiredInteger, initial: 0 })
    }
}

export type SpeedSchema = ReturnType<typeof speedSchema>
export type Speed = foundry.abstract.TypeDataModel<SpeedSchema, any>

export function calculateSpeeds(hero: HeroDataModel) {
    const dex = hero.stats.dexterity!
    const bonus = Number(hero.speed.bonus || 0)
    if (dex < 4) {
        hero.speed.turn = 25 + bonus
        hero.speed.crawl = (25 + bonus) * 3
        hero.speed.travel = 5
    }
    else if (dex < 6) {
        hero.speed.turn = 30 + bonus
        hero.speed.crawl = (30 + bonus) * 3
        hero.speed.travel = 6
    }
    else {
        hero.speed.turn = 35 + bonus
        hero.speed.crawl = (35 + bonus) * 3
        hero.speed.travel = 7
    }
}