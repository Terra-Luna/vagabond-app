import { fields, requiredInteger, uncappedInteger } from "../../common/sharedSchemas"
import HeroDataModel from "../HeroDataModel"

export const savesSchema = () => {
    return {
        // DEX + AWR
        reflex: new fields.NumberField({ ...requiredInteger, initial: 20 }),
        // MIT * 2
        endure: new fields.NumberField({ ...requiredInteger, initial: 20 }),
        // RSN + PRS
        will: new fields.NumberField({ ...requiredInteger, initial: 20 })
    }
}

export function setSaves(hero: HeroDataModel) {
    const base = 20
    hero.saves.reflex = base - (hero.stats.dexterity! + hero.stats.awareness!)
    hero.saves.endure = base - (hero.stats.might! * 2)
    hero.saves.will = base - (hero.stats.reason! + hero.stats.presence!)
}