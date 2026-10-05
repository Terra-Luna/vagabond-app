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

const makeSkillCheck = (favorHinder: 'favor' | 'hinder', explodeFavor = false) => Object.assign(Object.create(SkillCheck.prototype), {
    skill: 'melee',
    difficulty: 6,
    d20Count: 1,
    bonusDice: [],
    modifier: 0,
    critThreshold: 20,
    explodeFavor,
    favorHinder,
    clickEvent: undefined,
    result: undefined
}) as SkillCheck

describe('SkillCheck exploding favor die', () => {
    beforeEach(() => {
        queuedRolls = []
        ;(globalThis as any).Roll = MockRoll
        ;(globalThis as any).foundry.dice = { terms: { DiceTerm: MockDiceTerm } }
    })

    test('explodes the favor d6 on 6s and sums every result', async () => {
        const check = makeSkillCheck('favor', true)
        queuedRolls = [
            { total: 2 + 6, terms: [new MockDiceTerm(20, 2), new MockDiceTerm(6, 6)] },
            { total: 6, terms: [new MockDiceTerm(6, 6)] },
            { total: 3, terms: [new MockDiceTerm(6, 3)] }
        ]

        const result = await check.roll()

        expect(result.d6s).toEqual([6, 6, 3])
        expect(result.total).toBe(17)
        expect(result.rolls).toHaveLength(3)
    })

    test('does not explode when the favor d6 is not a 6', async () => {
        const check = makeSkillCheck('favor', true)
        queuedRolls = [{ total: 2 + 5, terms: [new MockDiceTerm(20, 2), new MockDiceTerm(6, 5)] }]

        const result = await check.roll()

        expect(result.d6s).toEqual([5])
        expect(result.total).toBe(7)
        expect(result.rolls).toHaveLength(1)
    })

    test('does not explode the favor d6 when explodeFavor is false', async () => {
        const check = makeSkillCheck('favor', false)
        queuedRolls = [{ total: 2 + 6, terms: [new MockDiceTerm(20, 2), new MockDiceTerm(6, 6)] }]

        const result = await check.roll()

        expect(result.d6s).toEqual([6])
        expect(result.total).toBe(8)
    })

    test('does not explode a hinder d6', async () => {
        const check = makeSkillCheck('hinder', true)
        queuedRolls = [{ total: 10 - 6, terms: [new MockDiceTerm(20, 10), new MockDiceTerm(6, 6)] }]

        const result = await check.roll()

        expect(result.d6s).toEqual([6])
        expect(result.total).toBe(4)
    })

    test('does not re-explode on reroll and keeps the summed favor d6', async () => {
        const check = makeSkillCheck('favor', true)
        queuedRolls = [
            { total: 2 + 6, terms: [new MockDiceTerm(20, 2), new MockDiceTerm(6, 6)] },
            { total: 4, terms: [new MockDiceTerm(6, 4)] },
            { total: 3, terms: [new MockDiceTerm(20, 3)] }
        ]

        await check.roll()
        const rerolled = await check.roll(true)

        expect(rerolled.d6s).toEqual([6, 4])
        expect(rerolled.total).toBe(13)
    })
})

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
        expect(rerolledResult.d6s).toEqual([1])
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
        expect(rerolledResult.d6s).toEqual([1])
        expect(rerolledResult.outcome).toBe(appLang.RollResult.failure)
    })
})