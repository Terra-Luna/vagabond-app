import { describe, expect, test } from "@jest/globals";
import { applyStatBonuses, baseStatBlocks } from "../../../../src/model/actor/type/Stats";
import HeroDataModel from "../../../../src/model/actor/HeroDataModel";

describe('hero stat tests', () => {
    test('stat blocks should sum to 26', () => {
        baseStatBlocks.forEach(block => {
            //console.log("Testing stat block:", block)
            const sum = block.reduce((x, y) => x + y)
            expect(sum).toBeGreaterThanOrEqual(22)
            expect(sum).toBeLessThanOrEqual(26)
            expect(block.length).toEqual(6)
        })
    })

    test('apply stat bonus', () => {
        //Setup
        const hero = {
            stats: { might: 5 },
            bonus: { might: 2 }
        }
        //Execute
        applyStatBonuses(hero as unknown as HeroDataModel)
        //Verify
        expect(hero.stats.might).toEqual(7)
    })
})