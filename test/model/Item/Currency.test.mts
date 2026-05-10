import { describe, expect, test } from "@jest/globals"
import Currency, { consolidateDenominations } from "../../../src/model/item/Currency.mts"

describe("consolidate denominations", () => {
    test('consolidates correctly', () => {
        // Setup
        const c = { g: 100, s: 251, c: 307 } as Currency
        // Execute
        consolidateDenominations(c)
        // Verify
        expect(c.g).toEqual(102)
        expect(c.s).toEqual(54)
        expect(c.c).toEqual(7)
    })
})