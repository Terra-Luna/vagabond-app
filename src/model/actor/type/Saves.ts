import { fields, requiredInteger, standardInteger } from "../../common/sharedSchemas"
import HeroDataModel from "../HeroDataModel"

export const savesSchema = () => {
    return {
        // DEX + AWR
        reflex: new fields.NumberField({ ...requiredInteger, initial: 20 }),
        reflexBonus: new fields.NumberField({ ...standardInteger }),
        // MIT * 2
        endure: new fields.NumberField({ ...requiredInteger, initial: 20 }),
        endureBonus: new fields.NumberField({ ...standardInteger }),
        // RSN + PRS
        will: new fields.NumberField({ ...requiredInteger, initial: 20 }),
        willBonus: new fields.NumberField({ ...standardInteger })
    }
}

export type SavesSchema = ReturnType<typeof savesSchema>
export type Saves = foundry.abstract.TypeDataModel<SavesSchema, any>

export function setSaves(hero: HeroDataModel) {
    const base = 20
    hero.saves.reflex = base - (hero.stats.dexterity! + hero.stats.awareness!)
    hero.saves.reflexBonus = 0
    hero.saves.endure = base - (hero.stats.might! * 2)
    hero.saves.endureBonus = 0
    hero.saves.will = base - (hero.stats.reason! + hero.stats.presence!)
    hero.saves.willBonus = 0
}