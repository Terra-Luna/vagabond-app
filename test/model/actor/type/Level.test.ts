import { describe, expect, test } from "@jest/globals"
import { setXpToNextLevel, HeroDataModel } from "../../../../src/model/actor/HeroDataModel"

describe('level functions', () => {
    test('xp to next level', () => {
        const hero = {
            level: { current: 3, xpToLevel: 0 }
        }
        setXpToNextLevel(hero as unknown as HeroDataModel)
        expect(hero.level.xpToLevel).toBe(40)
    })
})