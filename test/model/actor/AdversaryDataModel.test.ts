import { describe, expect, test } from "@jest/globals"
import { Adversary, calculateThreatLevel } from "../../../src/model/actor/AdversaryDataModel"
import { AdversaryAction } from "../../../src/model/actor/type/AdversaryAction"

describe('calculate threat level', () => {
    test('calculate tl with combo', () => {
        //Setup
        const actions = [
            { damage: { roll: '1d6', avg: 3 } } as AdversaryAction,
            { damage: { roll: '1d8', avg: 4 } } as AdversaryAction
        ]
        const adv = {
            health: { max: 31 },
            armor: { total: 3 },
            combo: { actions: actions }
        } as unknown as Adversary
        //Execute
        var tl = calculateThreatLevel(adv)
        //Verify
        expect(tl).toBe(3.44)
    })

    test('calculate tl avg of all actions', () => {
        //Setup
        const actions = [
            { damage: { roll: '1d12', avg: 6 } } as AdversaryAction,
            { damage: { roll: '1d8', avg: 4 } } as AdversaryAction
        ]
        const adv = {
            health: { max: 31 },
            armor: { total: 3 },
            actions: actions
        } as unknown as Adversary
        //Execute
        var tl = calculateThreatLevel(adv)
        //Verify
        expect(tl).toBe(3.11)
    })

    test('calculate when no actions', () => {
        //Setup
        const adv = {
            health: { max: 31 },
            armor: { total: 3 }
        } as unknown as Adversary
        //Execute
        var tl = calculateThreatLevel(adv)
        //Verify
        expect(tl).toBe(2.27)
    })
})