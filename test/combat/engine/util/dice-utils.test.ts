import { beforeEach, describe, expect, test } from "@jest/globals"

import { rollExplosions } from "../../../../src/combat/engine/util/dice-utils"

class MockDiceTerm {
    faces: number
    results: { result: number, active: boolean }[]

    constructor(faces: number, results: number[]) {
        this.faces = faces
        this.results = results.map(result => ({ result, active: true }))
    }
}

let queuedRolls: { total: number, terms: MockDiceTerm[] }[] = []
let formulas: string[] = []

class MockRoll {
    constructor(formula: string) { formulas.push(formula) }

    async evaluate() {
        return queuedRolls.shift()
    }
}

describe('rollExplosions', () => {
    beforeEach(() => {
        queuedRolls = []
        formulas = []
        ;(globalThis as any).Roll = MockRoll
        ;(globalThis as any).foundry.dice = { terms: { DiceTerm: MockDiceTerm } }
    })

    test('returns nothing when no die lands on an exploding value', async () => {
        const result = await rollExplosions([new MockDiceTerm(6, [1, 5]) as any], [6])

        expect(result).toEqual([])
        expect(formulas).toEqual([])
    })

    test('rolls one die per exploding result and chains further explosions', async () => {
        queuedRolls = [
            { total: 12, terms: [new MockDiceTerm(6, [6, 6])] },
            { total: 7, terms: [new MockDiceTerm(6, [6, 1])] },
            { total: 2, terms: [new MockDiceTerm(6, [2])] }
        ]

        const result = await rollExplosions([new MockDiceTerm(6, [6, 3, 6]) as any], [6])

        expect(formulas).toEqual(['2d6', '2d6', '1d6'])
        expect(result.map(r => r.total)).toEqual([12, 7, 2])
    })

    test('appends reroll modifiers to the explosion formula', async () => {
        queuedRolls = [{ total: 4, terms: [new MockDiceTerm(6, [4])] }]

        await rollExplosions([new MockDiceTerm(6, [6]) as any], [6], [1, 2])

        expect(formulas).toEqual(['1d6rr1rr2'])
    })
})
