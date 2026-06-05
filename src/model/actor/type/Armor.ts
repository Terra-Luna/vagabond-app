import { fields, requiredInteger } from "../../common/sharedSchemas"
import ArmorDataModel from "../../item/equip/ArmorDataModel"
import HeroDataModel from "../HeroDataModel"

export const armorSchema = () => {
    return {
        rating: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        as: new fields.StringField({ required: false })
    }
}

export function setArmorRating(hero: HeroDataModel) {
    const equippedArmor = getArmor(hero)
    hero.armor.rating = (equippedArmor?.rating || 0) + (hero.bonus.armor || 0)
}

const getArmor = (hero: HeroDataModel): ArmorDataModel => {
    return hero.inventory.items.find(i => i.isEquippedArmor) as unknown as ArmorDataModel
}