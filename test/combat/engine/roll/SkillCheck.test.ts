import { beforeEach, describe, expect, jest, test } from "@jest/globals"

import { SkillCheck } from "../../../../src/combat/engine/roll/SkillCheck"
import { appLang } from "../../../../src/utils/lang"

jest.mock("../../../../src/combat/engine/roll/DiceRoll", () => ({
    DiceRoll: class { }
}))
jest.mock("../../../../src/apps/vagabond-tools/relic/RelicPowerProcessor", () => ({
    RelicPowerProcessor: { applyRelicPowers: jest.fn() }
}))

class MockDiceTerm {
    faces: number
    results: { result: number, active: boolean }[]

    constructor(faces: number, result: number) {
        this.faces = faces
        this.results = [{ result, active: true }]
    }
}

let queuedRolls: { total: number, terms: MockDiceTerm[] }[] = []

class MockRoll {
    constructor(_formula: string) { }

    async evaluate() {
        return queuedRolls.shift()
    }
}

const makeSkillCheck = (favorHinder: 'favor' | 'hinder') => Object.assign(Object.create(SkillCheck.prototype), {
    skill: 'melee',
    difficulty: 6,
    d20Count: 1,
    bonusDice: [],
    modifier: 0,
    critThreshold: 20,
    favorHinder,
    clickEvent: undefined,
    result: undefined
}) as SkillCheck

describe('SkillCheck rerolls with favor or hinder', () => {
    beforeEach(() => {
        queuedRolls = []
        ;(globalThis as any).Roll = MockRoll
        ;(globalThis as any).foundry.dice = { terms: { DiceTerm: MockDiceTerm } }
    })

    test('keeps the original favor d6 in the rerolled total and outcome', async () => {
        const check = makeSkillCheck('favor')
        queuedRolls = [
            { total: 5, terms: [new MockDiceTerm(20, 4), new MockDiceTerm(6, 1)] },
            { total: 5, terms: [new MockDiceTerm(20, 5)] }
        ]

        await check.roll()
        const rerolledResult = await check.roll(true)

        expect(rerolledResult.total).toBe(6)
        expect(rerolledResult.d6).toBe(1)
        expect(rerolledResult.outcome).toBe(appLang.RollResult.success)
    })

    test('subtracts the original hinder d6 from the rerolled total', async () => {
        const check = makeSkillCheck('hinder')
        queuedRolls = [
            { total: 5, terms: [new MockDiceTerm(20, 6), new MockDiceTerm(6, 1)] },
            { total: 6, terms: [new MockDiceTerm(20, 6)] }
        ]

        await check.roll()
        const rerolledResult = await check.roll(true)

        expect(rerolledResult.total).toBe(5)
        expect(rerolledResult.d6).toBe(1)
        expect(rerolledResult.outcome).toBe(appLang.RollResult.failure)
    })
})