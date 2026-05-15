import { describe, expect, test } from "@jest/globals";
import HeroDataModel from "../../../../src/model/actor/HeroDataModel";
import { setPerkSlots } from "../../../../src/model/item/character/PerkDataModel";

describe('perk data model functions', () => {
    test('set perk slots lvl 10', () => {
        //Setup
        const hero = {
            level: { current: 10 },
            perkData: { perkSlots: 0 },
            bonus: { perkSlots: 0 }
        }
        //Execute
        setPerkSlots(hero as unknown as HeroDataModel)
        //Verify
        expect(hero.perkData.perkSlots).toEqual(4)
    })

    test('set perk slots lvl 1', () => {
        //Setup
        const hero = {
            level: { current: 1 },
            perkData: { perkSlots: 0 },
            bonus: { perkSlots: 0 }
        }
        //Execute
        setPerkSlots(hero as unknown as HeroDataModel)
        //Verify
        expect(hero.perkData.perkSlots).toEqual(0)
    })

    test('set perk slots lvl 6 with bonus', () => {
        //Setup
        const hero = {
            level: { current: 6 },
            perkData: { perkSlots: 0 },
            bonus: { perkSlots: 2 }
        }
        //Execute
        setPerkSlots(hero as unknown as HeroDataModel)
        //Verify
        expect(hero.perkData.perkSlots).toEqual(4)
    })
})