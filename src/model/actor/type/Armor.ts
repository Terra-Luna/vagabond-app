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
    const equippedArmor = getArmor(hero).filter(it => it.isEquipped)
    hero.armor.rating = equippedArmor.reduce(
        function (sum, it) {
            return sum += (it.rating || 0)
        }, 0
    ) + (hero.bonus.armor || 0)
}

const getArmor = (hero: HeroDataModel): ArmorDataModel[] => {
    return hero.parent.items.filter(i => i.type === 'armor')
}