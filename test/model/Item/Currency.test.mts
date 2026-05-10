import { describe, expect, test } from "@jest/globals";
import Currency, { consolidateDenominations } from "../../../src/model/item/Currency.mts";

describe("consolidateDenominations", () => {
    test('consolidates correctly', () => {
        const c = { g: 100, s: 251, c: 307 } as Currency
        consolidateDenominations(c)

        expect(c.g).toEqual(102)
        expect(c.s).toEqual(54)
        expect(c.c).toEqual(7)
    })
})