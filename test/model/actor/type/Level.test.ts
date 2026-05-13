import { describe, expect, test } from "@jest/globals";
import { calculateXpToNextLevel } from "../../../../src/model/actor/type/Level";
import HeroDataModel from "../../../../src/model/actor/HeroDataModel";

describe('level functions', () => {
    test('xp to next level', () => {
        const hero = {
            level: { current: 3, xpToLevel: 0 }
        }
        expect(calculateXpToNextLevel(hero as unknown as HeroDataModel)).toBe(20)
    })
})