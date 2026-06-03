import { fields, requiredString } from "../../common/sharedSchemas"
import HeroDataModel from "../HeroDataModel"

export const sensesSchema = () => {
    return {
        name: new fields.StringField({ ...requiredString }),
        description: new fields.StringField({ ...requiredString })
    }
}

export function setSenses(hero: HeroDataModel) {
    hero.ancestry.senses?.forEach(s => {
        if (!hero.senses.map(it => it.name).includes(s.name)) {
            hero.senses.push({ name: s.name, description: s.description })
        }
    })
}