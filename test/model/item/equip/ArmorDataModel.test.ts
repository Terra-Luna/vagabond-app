import { describe, expect, test } from "@jest/globals";
import HeroDataModel from "../../../../src/model/actor/HeroDataModel"
import { setArmorRating } from "../../../../src/model/actor/type/Armor";
import ArmorDataModel, { equipArmor } from "../../../../src/model/item/equip/ArmorDataModel";

describe('test armor equipment functions', () => {
    test('hero armor updated on equip new', () => {
        //Setup
        const oldArmor = { category: "Armor", type: 'heavy', rating: 3, isEquipped: true }
        const newArmor = { category: "Armor", type: 'light', rating: 1, isEquipped: false }
        const hero = {
            armor: { rating: 0 },
            inventory: {
                container: { items: [oldArmor, newArmor] }
            },
            bonus: { armor: 2 }
        }
        //Execute
        setArmorRating(hero as unknown as HeroDataModel)
        //Verify
        expect(hero.armor.rating).toEqual(5)
        //Equip new armor
        equipArmor(hero as unknown as HeroDataModel, newArmor as unknown as ArmorDataModel)
        setArmorRating(hero as unknown as HeroDataModel)
        //Verify again
        expect(hero.armor.rating).toEqual(3)
    })
})