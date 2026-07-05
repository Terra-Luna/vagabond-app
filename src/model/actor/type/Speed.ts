import { fields, requiredInteger } from "../../common/sharedSchemas"
import { HeroDataModel } from "../HeroDataModel"

export const speedSchema = () => {
    return {
        turn: new fields.NumberField({ ...requiredInteger, initial: 25 }),
        crawl: new fields.NumberField({ ...requiredInteger, initial: 75 }),
        travel: new fields.NumberField({ ...requiredInteger, initial: 5 })
    }
}

export function setSpeeds(hero: HeroDataModel) {
    const dex = hero.stats.dexterity!
    if (dex < 4) {
        hero.speed.turn = 25
        hero.speed.crawl = hero.speed.turn * 3
        hero.speed.travel = 5
    }
    else if (dex < 6) {
        hero.speed.turn = 30
        hero.speed.crawl = hero.speed.turn * 3
        hero.speed.travel = 6
    }
    else {
        hero.speed.turn = 35
        hero.speed.crawl = hero.speed.turn * 3
        hero.speed.travel = 7
    }
}