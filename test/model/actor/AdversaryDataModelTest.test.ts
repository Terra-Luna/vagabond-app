import { describe, expect, test } from "@jest/globals"
import AdversaryDataModel, { calculateThreatLevel } from "../../../src/model/actor/AdversaryDataModel"
import AdversaryActionDataModel from "../../../src/model/actor/attribute/AdversaryActionDataModel"

describe('calculate threat level', () => {
    test('calculate tl with combo', () => {
        //Setup
        const actions = [
            { damage: { roll: '1d6', avg: 3 } } as AdversaryActionDataModel,
            { damage: { roll: '1d8', avg: 4 } } as AdversaryActionDataModel
        ]
        const adv = {
            health: { max: 31 },
            armor: { total: 3 },
            combo: { actions: actions }
        } as unknown as AdversaryDataModel
        //Execute
        var tl = calculateThreatLevel(adv)
        //Verify
        expect(tl).toBe(3.44)
    })

    test('calculate tl avg of all actions', () => {
        //Setup
        const actions = [
            { damage: { roll: '1d12', avg: 6 } } as AdversaryActionDataModel,
            { damage: { roll: '1d8', avg: 4 } } as AdversaryActionDataModel
        ]
        const adv = {
            health: { max: 31 },
            armor: { total: 3 },
            actions: actions
        } as unknown as AdversaryDataModel
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
        } as unknown as AdversaryDataModel
        //Execute
        var tl = calculateThreatLevel(adv)
        //Verify
        expect(tl).toBe(2.27)
    })
})