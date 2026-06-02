import { fields, requiredInteger } from "../../common/sharedSchemas"
import ClassDataModel from "../../item/character/ClassDataModel"
import HeroDataModel from "../HeroDataModel"

export const manaSchema = () => {
    return {
        max: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        current: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        maxCast: new fields.NumberField({ integer: true })
    }
}

export function setManaValues(hero: HeroDataModel) {
    const clazz = hero.parent.items.find(i => i.type === 'class') as ClassDataModel
    if (clazz != undefined && clazz.castingSkill != null) {
        hero.mana.max = hero.level.current! * clazz.manaMultiplier! + hero.bonus.maxHP!
        hero.mana.maxCast = Math.ceil((hero.level.current!) / 2) + Number(hero.stats[clazz.maxManaStat!]) + hero.bonus.maxCast!
    }
}