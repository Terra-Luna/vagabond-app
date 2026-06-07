import { describe, expect, test } from "@jest/globals";
import HeroDataModel from "../../../../src/model/actor/HeroDataModel"
import { validateCurrentHP, setMaxHP } from "../../../../src/model/actor/type/Health"

describe('health component tests', () => {
    test('hp cant exceed max', () => {
        //Setup
        const hero = { health: { current: 3, max: 2 }, bonus: { maxHP: 0 } }
        //Execute
        validateCurrentHP(hero as unknown as HeroDataModel)
        //Verify
        expect(hero.health.current).toEqual(2)
    })

    test('set hp max', () => {
        //Setup
        const hero = {
            level: { current: 10 },
            stats: { might: 7 },
            health: { current: 3, max: 2 }
        }
        //Execute
        setMaxHP(hero as unknown as HeroDataModel)
        //Verify
        expect(hero.health.max).toEqual(70)
    })
})