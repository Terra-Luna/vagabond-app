import { describe, expect, test } from "@jest/globals"

import { addCoins, consolidateCoins, multiplyCoins, NOT_ENOUGH_COINS_ERROR, subtractCoins } from "../../../src/model/common/CoinValue"

describe('coin arithmetic tests', () => {
    test('consolidates correctly', () => {
        // Setup
        const c = { g: 100, s: 251, c: 307 }
        // Execute
        consolidateCoins(c)
        // Verify
        expect(c.g).toEqual(102)
        expect(c.s).toEqual(54)
        expect(c.c).toEqual(7)
    })

    test('add coins', () => {
        // Setup
        const a = { g: 99, s: 99, c: 99 }
        const b = { g: 2, s: 2, c: 2 }
        // Execute
        const total = addCoins([a, b])
        // Verify
        expect(total.g).toEqual(102)
        expect(total.s).toEqual(2)
        expect(total.c).toEqual(1)
    })

    test('subtract coins', () => {
        // Setup
        const a = { g: 99, s: 99, c: 99 }
        const b = { g: 2, s: 2, c: 2 }
        // Execute
        const total = subtractCoins(a, b)
        // Verify
        expect(total.g).toEqual(97)
        expect(total.s).toEqual(97)
        expect(total.c).toEqual(97)
    })

    test('subtract coins not enough', () => {
        // Setup
        const a = { g: 99, s: 99, c: 99 }
        const b = { g: 100, s: 100, c: 100 }
        consolidateCoins(b)
        // Execute & Verify
        expect(() => {
            subtractCoins(a, b)
        }).toThrow(NOT_ENOUGH_COINS_ERROR.message)
    })

    test('multiply coins', () => {
        // Setup
        const a = { g: 99, s: 99, c: 99 }
        // Execute
        const total = multiplyCoins(a, .5)
        // Verify
        expect(total.g).toEqual(49)
        expect(total.s).toEqual(99)
        expect(total.c).toEqual(99)
    })
})