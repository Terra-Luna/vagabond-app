import { describe, expect, test } from "@jest/globals";
import { xpToNextLevel } from "../../../../src/model/actor/type/Level";

describe('level functions', () => {
    test('xp to next level', () => {
        expect(xpToNextLevel(3)).toBe(20)
    })
})