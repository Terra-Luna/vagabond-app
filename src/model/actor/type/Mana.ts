import { fields, requiredInteger } from "../../common/sharedSchemas"
import HeroDataModel from "../HeroDataModel"

export const manaSchema = () => {
    return {
        max: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        current: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        maxCast: new fields.NumberField({ integer: true })
    }
}

export type ManaSchema = ReturnType<typeof manaSchema>
export type Mana = foundry.abstract.TypeDataModel<ManaSchema, any>

export function setManaValues(hero: HeroDataModel) {
    if (typeof hero.class.spellcastingData.castSkill !== null) {
        hero.mana.max = hero.level.current! * hero.class.spellcastingData.manaMultiplier!
        hero.mana.maxCast = Math.ceil((hero.level.current!) / 2) + Number(hero.stats[hero.class.spellcastingData.maxPerCastStat!])
    }
}