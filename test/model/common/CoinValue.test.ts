import { describe, expect, test } from "@jest/globals"
import { consolidate } from "../../../src/model/common/CoinValue"

describe('consolidate denominations', () => {
    test('consolidates correctly', () => {
        // Setup
        const c = { g: 100, s: 251, c: 307 }
        // Execute
        consolidate(c)
        // Verify
        expect(c.g).toEqual(102)
        expect(c.s).toEqual(54)
        expect(c.c).toEqual(7)
    })
})