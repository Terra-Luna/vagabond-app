import { describe, expect, test } from "@jest/globals";
import { baseStatBlocks } from "../../../../src/model/actor/type/Stats";

describe('hero stat tests', () => {
    test('stat blocks should sum to 26', () => {
        baseStatBlocks.forEach(block => {
            //console.log("Testing stat block:", block)
            const sum = block.reduce((x, y) => x + y)
            expect(sum).toBeGreaterThanOrEqual(22)
            expect(sum).toBeLessThanOrEqual(26)
            expect(block.length).toEqual(6)
        })
    })
})