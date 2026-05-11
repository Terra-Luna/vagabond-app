import { describe, expect, test } from "@jest/globals"
import WealthDataModel, { consolidate } from "../../../../src/model/actor/attribute/WealthDataModel"

describe('consolidate denominations', () => {
    test('consolidates correctly', () => {
        // Setup
        const c = { g: 100, s: 251, c: 307 }
        // Execute
        consolidate(c as unknown as WealthDataModel)
        // Verify
        expect(c.g).toEqual(102)
        expect(c.s).toEqual(54)
        expect(c.c).toEqual(7)
    })
})