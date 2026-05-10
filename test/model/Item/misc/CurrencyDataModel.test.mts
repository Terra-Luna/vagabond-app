import { describe, expect, test } from "@jest/globals"
import CurrencyDataModel, { consolidateDenominations } from "../../../../src/model/item/misc/CurrencyDataModel.mts"

describe("consolidate denominations", () => {
    test('consolidates correctly', () => {
        // Setup
        const c = { g: 100, s: 251, c: 307 } as CurrencyDataModel
        // Execute
        consolidateDenominations(c)
        // Verify
        expect(c.g).toEqual(102)
        expect(c.s).toEqual(54)
        expect(c.c).toEqual(7)
    })
})