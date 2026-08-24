import { describe, expect, test } from "@jest/globals"

import { setMaxHP, validateCurrentHP } from "../../../../src/model/actor/HeroDataModel"

describe('health component tests', () => {
    test('hp cant exceed max', () => {
        //Setup
        const hero = { health: { current: 3, max: 2 } }
        //Execute
        validateCurrentHP(hero as any)
        //Verify
        expect(hero.health.current).toEqual(2)
    })

    test('set hp max', () => {
        //Setup
        const hero = {
            level: { current: 10 },
            stats: { might: 7 },
            health: { current: 0, max: 0 },
            statuses: { counters: { fatigue: 0 } }
        }
        //Execute
        setMaxHP(hero as any)
        //Verify
        expect(hero.health.max).toEqual(70)
    })

    test('set hp max - fatigue death', () => {
        //Setup
        const hero = {
            level: { current: 10 },
            stats: { might: 7 },
            health: { current: 3, max: 2 },
            statuses: { counters: { fatigue: 5 } }
        }
        //Execute
        setMaxHP(hero as any)
        //Verify
        expect(hero.health.max).toEqual(0)
    })
})