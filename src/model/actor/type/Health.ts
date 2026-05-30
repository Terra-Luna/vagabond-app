import { FoundryActor } from "../../../view/sheets/actor/VgLiteActorSheet"
import { fields, requiredInteger } from "../../common/sharedSchemas"
import HeroDataModel from "../HeroDataModel"

export const healthSchema = () => {
    return {
        current: new fields.NumberField({ ...requiredInteger, initial: 1 }),
        max: new fields.NumberField({ ...requiredInteger, initial: 1 })
    }
}

export function validateCurrentHP(hero: HeroDataModel) {
    if (hero.health.current! > hero.health.max! + hero.bonus.maxHP!) {
        hero.health.current = hero.health.max!
    }
}

export function setMaxHP(hero: HeroDataModel) {
    hero.health.max = hero.stats.might! * (hero.level.current || 1) + hero.bonus.maxHP!
}