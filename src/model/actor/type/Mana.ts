import { fields, requiredInteger } from "../../common/sharedSchemas"
import { HeroDataModel } from "../HeroDataModel"

export const manaSchema = () => {
    return {
        max: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        current: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        maxCast: new fields.NumberField({ integer: true, initial: 0 })
    }
}

export function setManaValues(hero: HeroDataModel) {
    const cls = hero.class
    if (cls != undefined && cls.castingSkill != null) {
        hero.mana.max = hero.level.current! * cls.manaMultiplier!
        hero.mana.maxCast =
            hero.level.current! < 1 ? 0 :
            Math.ceil((hero.level.current!) / 2) + Number(hero.stats[cls?.maxManaStat?.toLowerCase() || ''])
    }
}