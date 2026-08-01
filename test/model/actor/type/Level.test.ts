import { describe, expect, test } from "@jest/globals"
import { setXpToNextLevel } from "../../../../src/model/actor/HeroDataModel"

describe('level functions', () => {
    test('xp to next level', () => {
        const hero = {
            level: { current: 3, xpToLevel: 0 }
        }
        setXpToNextLevel(hero as any)
        expect(hero.level.xpToLevel).toBe(40)
    })
})